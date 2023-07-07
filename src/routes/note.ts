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
  appendNoteBelowHeadline,
  createNote,
  createOrOverwriteNote,
  getNoteDetails,
  getNoteFile,
  prependNote,
  prependNoteBelowHeadline,
  renameFilepath,
  searchAndReplaceInNote,
  trashFilepath,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import { success } from "../utils/results-handling";
import { parseStringIntoRegex } from "../utils/string-handling";
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
  silent: zodOptionalBoolean,
  "if-exists": z.enum(["overwrite", "skip", ""]).optional(),
});
type CreateParams = z.infer<typeof createParams>;

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
  "create-if-not-found": zodOptionalBoolean,
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

const deleteParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
});
type DeleteParams = z.infer<typeof deleteParams>;

const renameParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  "new-filename": zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});
type RenameParams = z.infer<typeof renameParams>;

export type AnyLocalParams =
  | ListParams
  | ReadParams
  | OpenParams
  | CreateParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams
  | DeleteParams;

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
    { path: "/delete", schema: deleteParams, handler: handleDelete },
    { path: "/trash", schema: deleteParams, handler: handleTrash },
    { path: "/rename", schema: renameParams, handler: handleRename },
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
  return success({
    paths: window.app.vault.getMarkdownFiles().map((t) => t.path).sort(),
  });
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
    ? success({ message: STRINGS.open.note_opened }, res.result.path)
    : res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const { file, content } = params;
  const ifExists = params["if-exists"];

  // Check if there already is a note with that name or at that path.
  const res = await getNoteFile(file);
  if (res.isSuccess) {
    switch (ifExists) {
      case "skip":
        return await getNoteDetails(file);
        break;

      case "overwrite":
        const res1 = await createOrOverwriteNote(file, content || "");
        return res1.isSuccess ? await getNoteDetails(res1.result.path) : res1;
        break;

      default:
        // Default is to carry on and create a new note with a numeric suffix,
        // so we just fall through here. (Could've omitted the `default` case
        // but keeping it like this makes it clear what's going on.)
        break;
    }
  }

  const res2 = await createNote(file, content || "");
  return res2.isSuccess ? await getNoteDetails(res2.result.path) : res2;
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const { file, content } = params;
  const belowHeadline = params["below-headline"];
  const createIfNotFound = params["create-if-not-found"];
  const ensureNewline = params["ensure-newline"];

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function appendAsRequested() {
    if (belowHeadline) {
      return await appendNoteBelowHeadline(
        file,
        belowHeadline,
        content,
        ensureNewline,
      );
    }

    return await appendNote(file, content, ensureNewline);
  }

  // If the file exists, append to it. Otherwise, check if we're supposed to
  // create it.
  const res = await getNoteFile(file);
  if (res.isSuccess) {
    const res1 = await appendAsRequested();
    return res1.isSuccess ? success({ message: res1.result }, file) : res1;
  } else if (!createIfNotFound) {
    return res;
  }

  // We're supposed to create the note. We try to create it.
  const res2 = await createNote(file, "");
  if (!res2.isSuccess) {
    return res2;
  }

  // Creation was successful. We try to append again.
  const res3 = await appendAsRequested();
  return res3.isSuccess ? success({ message: res3.result }, file) : res3;
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const { file, content } = params;
  const belowHeadline = params["below-headline"];
  const createIfNotFound = params["create-if-not-found"];
  const ensureNewline = params["ensure-newline"];
  const ignoreFrontMatter = params["ignore-front-matter"];

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function prependAsRequested() {
    if (belowHeadline) {
      return await prependNoteBelowHeadline(
        file,
        belowHeadline,
        content,
        ensureNewline,
      );
    }

    return await prependNote(file, content, ensureNewline, ignoreFrontMatter);
  }

  // If the file exists, append to it. Otherwise, check if we're supposed to
  // create it.
  const res = await getNoteFile(file);
  if (res.isSuccess) {
    const res1 = await prependAsRequested();
    return res1.isSuccess ? success({ message: res1.result }, file) : res1;
  } else if (!createIfNotFound) {
    return res;
  }

  // We're supposed to create the note. We try to create it.
  const res2 = await createNote(file, "");
  if (!res2.isSuccess) {
    return res2;
  }

  // Creation was successful. We try to append again.
  const res3 = await prependAsRequested();
  return res3.isSuccess ? success({ message: res3.result }, file) : res3;
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { search, file, replace } = <SearchAndReplaceParams> incomingParams;
  const res = await searchAndReplaceInNote(file, search, replace);

  return res.isSuccess ? success({ message: res.result }, file) : res;
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { search, file, replace } = <SearchAndReplaceParams> incomingParams;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return resSir;
  }

  const res = await searchAndReplaceInNote(file, resSir.result, replace);
  return res.isSuccess ? success({ message: res.result }, file) : res;
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const res = await trashFilepath(file, true);

  return res.isSuccess ? success({ message: res.result }, file) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const res = await trashFilepath(file);

  return res.isSuccess ? success({ message: res.result }, file) : res;
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <RenameParams> incomingParams;
  const { file } = params;
  const res = await renameFilepath(file, params["new-filename"]);

  return res.isSuccess ? success({ message: res.result }, file) : res;
}
