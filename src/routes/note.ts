import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, Route } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  appendNote,
  createNote,
  createOrOverwriteNote,
  getNoteContent,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { helloRoute, namespaceRoutes } from "../utils/routing";
import { parseStringIntoRegex } from "../utils/string-handling";
import { zodOptionalBoolean, zodSanitizedFilePath } from "../utils/zod";

// SCHEMATA ----------------------------------------

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});
type CreateParams = z.infer<typeof createParams>;

const readParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});
type WriteParams = z.infer<typeof writeParams>;

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});
type PrependParams = z.infer<typeof prependParams>;

const searchAndReplaceParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});
type SearchAndReplaceParams = z.infer<typeof searchAndReplaceParams>;

export type AnyLocalParams =
  | CreateParams
  | ReadParams
  | WriteParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES ----------------------------------------

export const routes: Route[] = namespaceRoutes("note", [
  helloRoute(),
  { path: "get", schema: readParams, handler: handleGet },
  { path: "create", schema: createParams, handler: handleCreate },
  { path: "append", schema: appendParams, handler: handleAppend },
  { path: "prepend", schema: prependParams, handler: handlePrepend },
  {
    path: "search-string-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchStringAndReplace,
  },
  {
    path: "search-regex-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchRegexAndReplace,
  },
]);

// HANDLERS ----------------------------------------

async function handleGet(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <ReadParams> incomingParams;
  const { file } = params;
  const res = await getNoteContent(file);

  return (res.isSuccess)
    ? <HandlerFileSuccess> {
      isSuccess: true,
      result: { content: res.result, filepath: file },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <CreateParams> incomingParams;
  const { file, content, overwrite } = params;

  const result = overwrite
    ? await createOrOverwriteNote(file, content || "")
    : await createNote(file, content || "");

  return result
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: file },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
      input: params,
    };
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <AppendParams> incomingParams;
  const { file, content } = params;
  const res = await appendNote(file, content, params["ensure-newline"]);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <PrependParams> incomingParams;
  const { file, content } = params;
  const res = await prependNote(
    file,
    content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const regex = new RegExp(search, "g");
  const res = await searchAndReplaceInNote(file, regex, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resSir.error,
      input: params,
    };
  }

  const res = await searchAndReplaceInNote(file, resSir.result, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      input: params,
      processedFilepath: file,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
      input: params,
    };
}
