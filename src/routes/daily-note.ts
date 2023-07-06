import { z } from "zod";
import { TFile } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  createDailyNote,
  getAllDailyNotes,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
  TFileResultObject,
} from "../types";
import {
  appendNote,
  createOrOverwriteNote,
  getCurrentDailyNote,
  getDailyNotePathIfPluginIsAvailable,
  getNoteDetails,
  getNoteFile,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";
import { parseStringIntoRegex } from "../utils/string-handling";
import { zodAlwaysFalse, zodOptionalBoolean } from "../utils/zod";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

const readParams = incomingBaseParams.extend({
  silent: zodOptionalBoolean,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

const openParams = incomingBaseParams.extend({
  silent: zodAlwaysFalse,
});
type OpenParams = z.infer<typeof openParams>;

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
  "if-exists": z.enum(["overwrite", "skip", ""]).optional(),

  /**
   * @deprecated Deprecated in favor of `if-exists` parameter since v0.18.
   */
  overwrite: zodOptionalBoolean,
});
type CreateParams = z.infer<typeof createParams>;

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});
type WriteParams = z.infer<typeof writeParams>;

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});
type PrependParams = z.infer<typeof prependParams>;

const searchAndReplaceParams = incomingBaseParams.extend({
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
  | WriteParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/daily-note": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    { path: "/get-current", schema: readParams, handler: handleGetCurrent },
    {
      path: "/get-most-recent",
      schema: readParams,
      handler: handleGetMostRecent,
    },
    { path: "/open-current", schema: openParams, handler: handleOpenCurrent },
    {
      path: "/open-most-recent",
      schema: openParams,
      handler: handleOpenMostRecent,
    },
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
  incoming: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  if (!appHasDailyNotesPluginLoaded()) {
    return failure(412, STRINGS.daily_notes_feature_not_available);
  }

  const notes = getAllDailyNotes();

  return success({
    paths: Object.keys(notes).sort().reverse().map((k) => notes[k].path),
  });
}

async function handleGetCurrent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res = getDailyNotePathIfPluginIsAvailable();
  return res.isSuccess ? await getNoteDetails(res.result) : res;
}

async function handleGetMostRecent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res = await getMostRecentDailyNote();
  return res.isSuccess ? await getNoteDetails(res.result.path) : res;
}

async function handleOpenCurrent(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  // Since we force the `silent` param to be `false` (see section "SCHEMATA"
  // above), all this handlers needs to do is find the requested note path and
  // hand it back to the calling `handleIncomingCall()` (see `main.ts`) which
  // will take care of the rest.

  const res = getDailyNotePathIfPluginIsAvailable();
  return res.isSuccess
    ? success({ message: STRINGS.open.note_opened }, res.result)
    : res;
}

async function handleOpenMostRecent(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  // Since we force the `silent` param to be `false` (see section "SCHEMATA"
  // above), all this handlers needs to do is find the requested note path and
  // hand it back to the calling `handleIncomingCall()` (see `main.ts`) which
  // will take care of the rest.

  const res = await getMostRecentDailyNote();
  return res.isSuccess
    ? success({ message: STRINGS.open.note_opened }, res.result.path)
    : res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return failure(412, STRINGS.daily_notes_feature_not_available);
  }

  const { content } = params;
  const dailyNote = getCurrentDailyNote();

  // TODO: Added in 0.18. Can be removed when `params.overwrite` is removed.
  if (!params["if-exists"] && params.overwrite) {
    params["if-exists"] = "overwrite";
  }

  // There already is a note for today.
  if (dailyNote instanceof TFile) {
    switch (params["if-exists"]) {
      case "skip":
        return await getNoteDetails(dailyNote.path);

      case "overwrite":
        // Delete existing note, but keep going afterwards.
        app.vault.trash(dailyNote, false);
        break;

      default:
        return failure(409, STRINGS.daily_note.create_note_already_exists);
    }
  }

  // There is no note for today.  Let's create one!
  const newNote = await createDailyNote(window.moment());
  if (!(newNote instanceof TFile)) {
    return failure(400, STRINGS.unable_to_write_note);
  }

  // The note was written, but we need to write content to it. Do we have
  // content?  If not then we're done already.
  if (typeof content !== "string" || content === "") {
    return await getNoteDetails(newNote.path);
  }

  // We have content to write, let's update the note.
  const resFile = await createOrOverwriteNote(newNote.path, content);
  return resFile.isSuccess
    ? await getNoteDetails(resFile.result.path)
    : resFile;
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;

  // See if the file exists, and if so, append to it.
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (resDNP.isSuccess) {
    const filepath = resDNP.result;
    const res = await appendNote(
      filepath,
      params.content,
      params["ensure-newline"],
    );

    return res.isSuccess ? success({ message: res.result }, filepath) : res;
  }

  // No, the file didn't exist. Unless it just couldn't be found (as opposed to
  // any other error), we're done.
  if (resDNP.errorCode !== 404) {
    return resDNP;
  }

  // The file didn't exist, because it hasn't been created yet. Should we create
  // it? If not, we're done.
  if (!params["create-if-not-found"]) {
    return resDNP;
  }

  // We're allowed to create the file, so let's do that.
  const newNote = await createDailyNote(window.moment());
  if (newNote instanceof TFile) {
    const res = await appendNote(
      newNote.path,
      params.content,
      params["ensure-newline"],
    );

    return res.isSuccess ? success({ message: res.result }, newNote.path) : res;
  }

  // If that didn't work, return an error.
  return failure(400, STRINGS.unable_to_write_note);
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;

  // See if the file exists, and if so, append to it.
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (resDNP.isSuccess) {
    const filepath = resDNP.result;
    const res = await prependNote(
      filepath,
      params.content,
      params["ensure-newline"],
      params["ignore-front-matter"],
    );

    return res.isSuccess ? success({ message: res.result }, filepath) : res;
  }

  // No, the file didn't exist. Unless it just couldn't be found (as opposed to
  // any other error), we're done.
  if (resDNP.errorCode !== 404) {
    return resDNP;
  }

  // The file didn't exist, because it hasn't been created yet. Should we create
  // it? If not, we're done.
  if (!params["create-if-not-found"]) {
    return resDNP;
  }

  // We're allowed to create the file, so let's do that.
  const newNote = await createDailyNote(window.moment());
  if (newNote instanceof TFile) {
    const res = await prependNote(
      newNote.path,
      params.content,
      params["ensure-newline"],
      params["ignore-front-matter"],
    );
    return res.isSuccess ? success({ message: res.result }, newNote.path) : res;
  }

  // If that didn't work, return an error.
  return failure(400, STRINGS.unable_to_write_note);
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return resDNP;
  }

  const filepath = resDNP.result;
  const { search, replace } = params;
  const res = await searchAndReplaceInNote(filepath, search, replace);

  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return resDNP;
  }

  const resSir = parseStringIntoRegex(params.search);
  if (!resSir.isSuccess) {
    return resSir;
  }

  const filepath = resDNP.result;
  const res = await searchAndReplaceInNote(
    filepath,
    resSir.result,
    params.replace,
  );
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

// HELPERS -------------------------------------

async function getMostRecentDailyNote(): Promise<TFileResultObject> {
  if (!appHasDailyNotesPluginLoaded()) {
    return failure(412, STRINGS.daily_notes_feature_not_available);
  }

  const notes = getAllDailyNotes();
  const mostRecentKey = Object.keys(notes).sort().last();
  if (!mostRecentKey) {
    return failure(404, STRINGS.note_not_found);
  }

  const dailyNote = notes[mostRecentKey];
  return await getNoteFile(dailyNote.path);
}
