import { TFile, Vault } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import {
  createNote,
  createOrOverwriteNote,
  getNoteContent,
} from "../utils/file-handling";
import {
  basePayloadSchema,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import { helloRoute } from "../utils/routing";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Result,
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

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
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
  | z.infer<typeof PrependPayload>
  | z.infer<typeof SearchAndReplacePayload>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("note"),
  { path: "note/get", schema: ReadPayload, handler: handleNoteGet },
  { path: "note/create", schema: CreatePayload, handler: handleNoteCreate },
  { path: "note/append", schema: WritePayload, handler: handleNoteAppend },
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
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof ReadPayload>;
  const { file } = payload;
  const res = await getNoteContent(file, vault);

  return (res.success)
    ? <HandlerFileSuccess> {
      success: true,
      data: { file, content: res.result },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: res.error,
      input: payload,
    };
}

async function handleNoteCreate(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof CreatePayload>;
  const { file, content, overwrite } = payload;

  const result = overwrite
    ? await createOrOverwriteNote(file, content || "", vault)
    : await createNote(file, content || "", vault);

  return result
    ? <HandlerTextSuccess> {
      success: true,
      data: { result: file },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: STRINGS.unable_to_write_note,
      input: payload,
    };
}

async function handleNoteAppend(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  const { file, content } = payload;
  const res = await getNoteContent(file, vault);

  if (!res.success) {
    return <HandlerFailure> {
      success: false,
      error: res.error,
      input: payload,
    };
  }

  const noteContent = res.result;
  const newContent = noteContent + content;
  const updatedFile = await createOrOverwriteNote(file, newContent, vault);

  return (updatedFile instanceof TFile)
    ? <HandlerTextSuccess> {
      success: true,
      data: { result: STRINGS.append_done },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: STRINGS.unable_to_write_note,
      input: payload,
    };
}

// TODO: handleNotePrepend()
async function handleNotePrepend(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

async function handleNoteSearchStringAndReplace(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { search } = payload;
  return await searchAndReplaceInNote(data, new RegExp(search, "g"), vault);
}

async function handleNoteSearchRegexAndReplace(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { search } = payload;
  const res = parseStringIntoRegex(search);

  return res.success
    ? await searchAndReplaceInNote(data, res.result, vault)
    : <HandlerFailure> {
      success: false,
      error: res.error,
      input: payload,
    };
}

// HELPERS --------------------

async function searchAndReplaceInNote(
  data: ZodSafeParsedData,
  search: string | RegExp,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { file, replace } = payload;
  const res = await getNoteContent(file, vault);

  if (!res.success) {
    return <HandlerFailure> {
      success: false,
      error: res.error,
      input: payload,
    };
  }

  const noteContent = res.result;
  const newContent = noteContent.replace(search, replace);

  if (noteContent === newContent) {
    return <HandlerTextSuccess> {
      success: true,
      data: {
        result: typeof search === "string"
          ? STRINGS.search_string_not_found
          : STRINGS.search_pattern_not_found,
      },
      input: payload,
    };
  }

  const updatedFile = await createOrOverwriteNote(file, newContent, vault);

  return (updatedFile instanceof TFile)
    ? <HandlerTextSuccess> {
      success: true,
      data: { result: STRINGS.replacement_done },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: STRINGS.unable_to_write_note,
      input: payload,
    };
}

function parseStringIntoRegex(search: string): Result {
  let searchPattern: RegExp;

  if (!search.startsWith("/")) {
    return <Result> {
      success: false,
      error: STRINGS.search_pattern_invalid,
    };
  }

  // Starts to look like a regex, let's try to parse it.
  let re = search.slice(1);
  const lastSlashIdx = re.lastIndexOf("/");

  if (lastSlashIdx === 0) {
    return <Result> {
      success: false,
      error: STRINGS.search_pattern_empty,
    };
  }

  let flags = re.slice(lastSlashIdx + 1);
  re = re.slice(0, lastSlashIdx);

  try {
    searchPattern = new RegExp(re, flags);
  } catch (e) {
    return <Result> {
      success: false,
      error: STRINGS.search_pattern_unparseable,
    };
  }

  return <Result> {
    success: true,
    result: searchPattern,
  };
}
