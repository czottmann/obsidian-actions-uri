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
  appendNoteBelowHeadline,
  createOrOverwriteNote,
  getCurrentDailyNote,
  getDailyNotePathIfPluginIsAvailable,
  getNoteDetails,
  getNoteFile,
  prependNote,
  prependNoteBelowHeadline,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "../utils/plugins";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";
import { parseStringIntoRegex } from "../utils/string-handling";
import { pause } from "../utils/time";
import { focusOrOpenNote } from "../utils/ui";
import {
  zodAlwaysFalse,
  zodExistingFilePath,
  zodOptionalBoolean,
} from "../utils/zod";

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

const createBaseParams = incomingBaseParams.extend({
  "if-exists": z.enum(["overwrite", "skip"]).optional(),
  silent: zodOptionalBoolean,
});
const createParams = z.discriminatedUnion("apply", [
  createBaseParams.extend({
    apply: z.literal("content"),
    content: z.string().optional(),
  }),
  createBaseParams.extend({
    apply: z.literal("templater"),
    "template-file": zodExistingFilePath,
  }),
  createBaseParams.extend({
    apply: z.literal("templates"),
    "template-file": zodExistingFilePath,
  }),
  createBaseParams.extend({
    apply: z.undefined(),
    content: z.string().optional(),
  }),
]);
type CreateParams = z.infer<typeof createParams>;

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});
type WriteParams = z.infer<typeof writeParams>;

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
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
  const { apply } = params;
  const ifExists = params["if-exists"];
  var pluginInstance;

  if (!appHasDailyNotesPluginLoaded()) {
    return failure(412, STRINGS.daily_notes_feature_not_available);
  }

  // If the user wants to apply a template, we need to check if the relevant
  // plugin is available, and if not, we return from here.
  if (apply === "templater") {
    const pluginRes = getEnabledCommunityPlugin("templater-obsidian");
    if (!pluginRes.isSuccess) return pluginRes;
    pluginInstance = pluginRes.result.templater;
  } else if (apply === "templates") {
    const pluginRes = getEnabledCorePlugin("templates");
    if (!pluginRes.isSuccess) return pluginRes;
    pluginInstance = pluginRes.result;
  }

  // If there already is a note for today, deal with it.
  const dailyNote = getCurrentDailyNote();
  if (dailyNote instanceof TFile) {
    switch (ifExists) {
      // `skip` == Leave not as-is, we just return the existing note.
      case "skip":
        return await getNoteDetails(dailyNote.path);

      // Overwrite the existing note.
      case "overwrite":
        // Delete existing note, but keep going afterwards.
        await app.vault.trash(dailyNote, false);
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
  const filepath = newNote.path;
  await pause(100);

  switch (apply) {
    case "content":
      const content = params.content || "";
      if (content) {
        await createOrOverwriteNote(filepath, content);
      }
      break;

    // Testing for existence of template file is done by a zod schema, so we can
    // be sure the file exists.
    case "templater":
      await pluginInstance.write_template_to_file(
        params["template-file"],
        newNote,
      );
      break;

    // Testing for existence of template file is done by a zod schema, so we can
    // be sure the file exists.
    case "templates":
      await createOrOverwriteNote(filepath, "");
      await focusOrOpenNote(filepath);
      await pause(100);
      await pluginInstance.insertTemplate(params["template-file"]);
      break;
  }

  return await getNoteDetails(filepath);
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const { content } = params;
  const belowHeadline = params["below-headline"];
  const createIfNotFound = params["create-if-not-found"];
  const ensureNewline = params["ensure-newline"];

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function appendAsRequested(filepath: string) {
    if (belowHeadline) {
      return await appendNoteBelowHeadline(
        filepath,
        belowHeadline,
        content,
        ensureNewline,
      );
    }

    return await appendNote(filepath, content, ensureNewline);
  }

  // See if the file exists, and if so, append to it.
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (resDNP.isSuccess) {
    const filepath = resDNP.result;
    const res = await appendAsRequested(filepath);
    return res.isSuccess ? success({ message: res.result }, filepath) : res;
  }

  // No, the file didn't exist. Unless it just couldn't be found (as opposed to
  // any other error), we're done.
  if (resDNP.errorCode !== 404) {
    return resDNP;
  }

  // The file didn't exist, because it hasn't been created yet. Should we create
  // it? If not, we're done.
  if (!createIfNotFound) {
    return resDNP;
  }

  // We're allowed to create the file, so let's do that.
  const newNote = await createDailyNote(window.moment());
  if (newNote instanceof TFile) {
    const res = await appendAsRequested(newNote.path);
    return res.isSuccess ? success({ message: res.result }, newNote.path) : res;
  }

  // If that didn't work, return an error.
  return failure(400, STRINGS.unable_to_write_note);
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const { content } = params;
  const belowHeadline = params["below-headline"];
  const createIfNotFound = params["create-if-not-found"];
  const ensureNewline = params["ensure-newline"];
  const ignoreFrontMatter = params["ignore-front-matter"];

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function prependAsRequested(filepath: string) {
    if (belowHeadline) {
      return await prependNoteBelowHeadline(
        filepath,
        belowHeadline,
        content,
        ensureNewline,
      );
    }

    return await prependNote(
      filepath,
      content,
      ensureNewline,
      ignoreFrontMatter,
    );
  }

  // See if the file exists, and if so, append to it.
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (resDNP.isSuccess) {
    const filepath = resDNP.result;
    const res = await prependAsRequested(filepath);
    return res.isSuccess ? success({ message: res.result }, filepath) : res;
  }

  // No, the file didn't exist. Unless it just couldn't be found (as opposed to
  // any other error), we're done.
  if (resDNP.errorCode !== 404) {
    return resDNP;
  }

  // The file didn't exist, because it hasn't been created yet. Should we create
  // it? If not, we're done.
  if (!createIfNotFound) {
    return resDNP;
  }

  // We're allowed to create the file, so let's do that.
  const newNote = await createDailyNote(window.moment());
  if (newNote instanceof TFile) {
    const res = await prependAsRequested(newNote.path);
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
