import { Vault } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import {
  basePayloadSchema,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";
import {
  appendNote,
  createNote,
  createOrOverwriteNote,
  getNoteContent,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { parseStringIntoRegex } from "../utils/grabbag";
import { helloRoute } from "../utils/routing";

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
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string(),
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
  { path: "note/get", schema: ReadPayload, handler: handleGet },
  { path: "note/create", schema: CreatePayload, handler: handleCreate },
  { path: "note/append", schema: AppendPayload, handler: handleAppend },
  { path: "note/prepend", schema: PrependPayload, handler: handlePrepend },
  {
    path: "note/search-string-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleGet(
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

async function handleCreate(
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

async function handleAppend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof AppendPayload>;
  const { file, content } = params;
  const res = await appendNote(file, vault, content, params["ensure-newline"]);

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

async function handlePrepend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof PrependPayload>;
  const { file, content } = params;
  const res = await prependNote(
    file,
    vault,
    content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

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

async function handleSearchStringAndReplace(
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

async function handleSearchRegexAndReplace(
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
