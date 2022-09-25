import { TFile, Vault } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import {
  createNote,
  createOrOverwriteNote,
  getNoteContent,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import {
  basePayloadSchema,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import { ensureNewline, parseStringIntoRegex } from "../utils/grabbag";
import { helloRoute } from "../utils/routing";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const CreatePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const ReadPayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const WritePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

const AppendPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

const SearchAndReplacePayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

export type PayloadUnion =
  | z.infer<typeof CreatePayload>
  | z.infer<typeof ReadPayload>
  | z.infer<typeof WritePayload>
  | z.infer<typeof AppendPayload>
  | z.infer<typeof PrependPayload>
  | z.infer<typeof SearchAndReplacePayload>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("note"),
  { path: "note/get", schema: ReadPayload, handler: handleNoteGet },
  { path: "note/create", schema: CreatePayload, handler: handleNoteCreate },
  { path: "note/append", schema: AppendPayload, handler: handleNoteAppend },
  { path: "note/prepend", schema: PrependPayload, handler: handleNotePrepend },
  {
    path: "note/search-string-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleNoteGet(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof ReadPayload>;
  const { file } = params;
  const res = await getNoteContent(file, vault);

  return (res.isSuccess)
    ? <HandlerFileSuccess> {
      isSuccess: true,
      result: { file, content: res.result },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handleNoteCreate(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof CreatePayload>;
  const { file, content, overwrite } = params;

  const result = overwrite
    ? await createOrOverwriteNote(file, vault, content || "")
    : await createNote(file, vault, content || "");

  return result
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: file },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
      input: params,
    };
}

async function handleNoteAppend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof AppendPayload>;
  const { file } = params;
  let { content } = params;
  const res = await getNoteContent(file, vault);

  if (!res.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
  }

  if (params["ensure-newline"]) {
    content = ensureNewline(content);
  }

  const noteContent = res.result;
  const newContent = noteContent + content;
  const updatedFile = await createOrOverwriteNote(file, vault, newContent);

  return (updatedFile instanceof TFile)
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: STRINGS.append_done },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
      input: params,
    };
}

async function handleNotePrepend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof PrependPayload>;
  const { file } = params;
  let { content } = params;
  const res = await getNoteContent(file, vault);

  if (!res.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
  }

  let newContent: string;
  const noteContent = res.result.trimStart();
  const hasFrontMatter = noteContent.startsWith("---\n") &&
    (noteContent.indexOf("---\n", 4) > -1);

  if (hasFrontMatter && !params["ignore-front-matter"]) {
    const bodyStartPos = noteContent.indexOf("---\n", 4) + 4;
    const frontMatter = noteContent.slice(0, bodyStartPos);
    const noteBody = noteContent.slice(bodyStartPos);
    newContent = frontMatter + ensureNewline(content) + noteBody;
  } else {
    if (params["ensure-newline"]) {
      content = ensureNewline(content);
    }
    newContent = content + noteContent;
  }

  const updatedFile = await createOrOverwriteNote(file, vault, newContent);

  return (updatedFile instanceof TFile)
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: STRINGS.prepend_done },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
      input: params,
    };
}

async function handleNoteSearchStringAndReplace(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof SearchAndReplacePayload>;
  const { search, file, replace } = params;
  const regex = new RegExp(search, "g");
  const res = await searchAndReplaceInNote(file, vault, regex, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handleNoteSearchRegexAndReplace(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof SearchAndReplacePayload>;
  const { search, file, replace } = params;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resSir.error,
      input: params,
    };
  }

  const res = await searchAndReplaceInNote(file, vault, resSir.result, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}
