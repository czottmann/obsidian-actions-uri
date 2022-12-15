import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  appendNote,
  createNote,
  createOrOverwriteNote,
  getNoteDetails,
  getNoteFile,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import {
  extractNoteContentParts,
  parseStringIntoRegex,
  unwrapFrontMatter,
} from "../utils/string-handling";
import {
  zodAlwaysFalse,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

const readParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

const openParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodAlwaysFalse,
});
type OpenParams = z.infer<typeof openParams>;

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});
type CreateParams = z.infer<typeof createParams>;

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
  | ListParams
  | ReadParams
  | OpenParams
  | CreateParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/note": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    { path: "/get", schema: readParams, handler: handleGet },
    { path: "/open", schema: openParams, handler: handleOpen },
    { path: "/create", schema: createParams, handler: handleCreate },
    { path: "/append", schema: appendParams, handler: handleAppend },
    { path: "/prepend", schema: prependParams, handler: handlePrepend },
    {
      path: "/search-string-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchStringAndReplace,
    },
    {
      path: "/search-regex-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchRegexAndReplace,
    },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  const { vault } = window.app;
  const paths = vault.getMarkdownFiles().map((t) => t.path).sort();

  return {
    isSuccess: true,
    result: {
      paths,
    },
  };
}

async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <ReadParams> incomingParams;
  return await getNoteDetails(params.file);
}

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const res = await getNoteFile(params.file);
  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result.path,
    }
    : res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const { file, content, overwrite } = params;

  const res = overwrite
    ? await createOrOverwriteNote(file, content || "")
    : await createNote(file, content || "");

  return res.isSuccess ? await getNoteDetails(file) : res;
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const { file, content } = params;
  const res = await appendNote(file, content, params["ensure-newline"]);

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : res;
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const { file, content } = params;
  const res = await prependNote(
    file,
    content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : res;
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const res = await searchAndReplaceInNote(file, search, replace);

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : res;
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return resSir;
  }

  const res = await searchAndReplaceInNote(file, resSir.result, replace);

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : res;
}
