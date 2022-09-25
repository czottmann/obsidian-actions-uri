import { Vault } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import {
  incomingBaseParams,
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

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const readParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

const searchAndReplaceParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

export type ParamsUnion =
  | z.infer<typeof createParams>
  | z.infer<typeof readParams>
  | z.infer<typeof writeParams>
  | z.infer<typeof appendParams>
  | z.infer<typeof prependParams>
  | z.infer<typeof searchAndReplaceParams>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("note"),
  { path: "note/get", schema: readParams, handler: handleGet },
  { path: "note/create", schema: createParams, handler: handleCreate },
  { path: "note/append", schema: appendParams, handler: handleAppend },
  { path: "note/prepend", schema: prependParams, handler: handlePrepend },
  {
    path: "note/search-string-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleGet(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof readParams>;
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
  const params = incomingParams as z.infer<typeof createParams>;
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
  const params = incomingParams as z.infer<typeof appendParams>;
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
  const params = incomingParams as z.infer<typeof prependParams>;
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
  const params = incomingParams as z.infer<typeof searchAndReplaceParams>;
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
  const params = incomingParams as z.infer<typeof searchAndReplaceParams>;
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
