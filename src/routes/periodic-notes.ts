import { z } from "zod";
import { TFile } from "obsidian";
import { STRINGS } from "src/constants";
import { AnyParams, RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerFunction,
  HandlerPathsSuccess,
  HandlerTextSuccess,
  RealLifePlugin,
} from "src/types";
import {
  appendNote,
  appendNoteBelowHeadline,
  applyCorePluginTemplate,
  createOrOverwriteNote,
  getNoteDetails,
  prependNote,
  prependNoteBelowHeadline,
  searchAndReplaceInNote,
} from "src/utils/file-handling";
import {
  checkForEnabledPeriodicNoteFeature,
  createPeriodicNote,
  getAllPeriodicNotes,
  getCurrentPeriodicNote,
  getExistingPeriodicNotePathIfPluginIsAvailable,
  getMostRecentPeriodicNotePath,
  PeriodicNoteType,
} from "src/utils/periodic-notes-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "src/utils/plugins";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";
import { parseStringIntoRegex } from "src/utils/string-handling";
import { pause } from "src/utils/time";
import { focusOrOpenFile } from "src/utils/ui";
import {
  zodEmptyStringChangedToDefaultString,
  zodExistingTemplaterPath,
  zodExistingTemplatesPath,
  zodOptionalBoolean,
  zodUndefinedChangedToDefaultValue,
} from "src/utils/zod";

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

const openParams = incomingBaseParams;
type OpenParams = z.infer<typeof openParams>;

const createBaseParams = incomingBaseParams.extend({
  "if-exists": z.enum(["overwrite", "skip", ""]).optional(),
  silent: zodOptionalBoolean,
});
const createParams = z.discriminatedUnion("apply", [
  createBaseParams.extend({
    apply: z.literal("content"),
    content: z.string().optional(),
  }),
  createBaseParams.extend({
    apply: z.literal("templater"),
    "template-file": zodExistingTemplaterPath,
  }),
  createBaseParams.extend({
    apply: z.literal("templates"),
    "template-file": zodExistingTemplatesPath,
  }),
  createBaseParams.extend({
    apply: zodEmptyStringChangedToDefaultString("content"),
    content: z.string().optional(),
  }),
  createBaseParams.extend({
    apply: zodUndefinedChangedToDefaultValue("content"),
    content: z.string().optional(),
  }),
]);
type CreateParams = z.infer<typeof createParams>;
type createContentParams = {
  apply: "content";
  content?: string;
};
type createTemplateParams = {
  apply: "templater" | "templates";
  "template-file": TFile;
};

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

const routes: RoutePath = {};
for (const periodicNoteType of Object.values(PeriodicNoteType)) {
  routes[`${periodicNoteType}-note`] = [
    helloRoute(),
    {
      path: "/list",
      schema: listParams,
      handler: getHandleList(periodicNoteType),
    },
    {
      path: "/get-current",
      schema: readParams,
      handler: getHandleGetCurrent(periodicNoteType),
    },
    {
      path: "/get-most-recent",
      schema: readParams,
      handler: getHandleGetMostRecent(periodicNoteType),
    },
    {
      path: "/open-current",
      schema: openParams,
      handler: getHandleOpenCurrent(periodicNoteType),
    },
    {
      path: "/open-most-recent",
      schema: openParams,
      handler: getHandleOpenMostRecent(periodicNoteType),
    },
    {
      path: "/create",
      schema: createParams,
      handler: getHandleCreate(periodicNoteType),
    },
    {
      path: "/append",
      schema: appendParams,
      handler: getHandleAppend(periodicNoteType),
    },
    {
      path: "/prepend",
      schema: prependParams,
      handler: getHandlePrepend(periodicNoteType),
    },
    {
      path: "/search-string-and-replace",
      schema: searchAndReplaceParams,
      handler: getHandleSearchStringAndReplace(periodicNoteType),
    },
    {
      path: "/search-regex-and-replace",
      schema: searchAndReplaceParams,
      handler: getHandleSearchRegexAndReplace(periodicNoteType),
    },
  ];
}
export const routePath = routes;

// HANDLERS ----------------------------------------

function getHandleList(periodicNoteType: PeriodicNoteType): HandlerFunction {
  return async function handleList(
    incoming: AnyParams,
  ): Promise<HandlerPathsSuccess | HandlerFailure> {
    if (!checkForEnabledPeriodicNoteFeature(periodicNoteType)) {
      return failure(
        ErrorCode.FeatureUnavailable,
        STRINGS[`${periodicNoteType}_note`].feature_not_available,
      );
    }

    const notes = getAllPeriodicNotes(periodicNoteType);
    return success({
      paths: Object.keys(notes).sort().reverse().map((k) => notes[k].path),
    });
  };
}

function getHandleGetCurrent(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleGetCurrent(
    incomingParams: AnyParams,
  ): Promise<HandlerFileSuccess | HandlerFailure> {
    const { silent } = <ReadParams> incomingParams;
    const shouldFocusNote = !silent;

    const res = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    if (!res.isSuccess) return res;
    const filepath = res.result;
    if (shouldFocusNote) await focusOrOpenFile(filepath);
    return await getNoteDetails(filepath);
  };
}

function getHandleGetMostRecent(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleGetMostRecent(
    incomingParams: AnyParams,
  ): Promise<HandlerFileSuccess | HandlerFailure> {
    const { silent } = <ReadParams> incomingParams;
    const shouldFocusNote = !silent;

    const res = getMostRecentPeriodicNotePath(periodicNoteType);
    if (!res.isSuccess) return res;
    const filepath = res.result;
    if (shouldFocusNote) await focusOrOpenFile(filepath);
    return await getNoteDetails(filepath);
  };
}

function getHandleOpenCurrent(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleOpenCurrent(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    // Since we force the `silent` param to be `false` (see section "SCHEMATA"
    // above), all this handlers needs to do is find the requested note path and
    // hand it back to the calling `handleIncomingCall()` (see `main.ts`) which
    // will take care of the rest.

    const res = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    return res.isSuccess
      ? success({ message: STRINGS.note_opened }, res.result)
      : res;
  };
}

function getHandleOpenMostRecent(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleOpenMostRecent(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    // Since we force the `silent` param to be `false` (see section "SCHEMATA"
    // above), all this handlers needs to do is find the requested note path and
    // hand it back to the calling `handleIncomingCall()` (see `main.ts`) which
    // will take care of the rest.

    const res = await getMostRecentPeriodicNotePath(periodicNoteType);
    return res.isSuccess
      ? success({ message: STRINGS.note_opened }, res.result)
      : res;
  };
}

function getHandleCreate(periodicNoteType: PeriodicNoteType): HandlerFunction {
  return async function handleCreate(
    this: RealLifePlugin,
    incomingParams: AnyParams,
  ): Promise<HandlerFileSuccess | HandlerFailure> {
    const params = <CreateParams> incomingParams;
    const { apply, silent } = params;
    const ifExists = params["if-exists"];
    const shouldFocusNote = !silent;
    const templateFile = (apply === "templater" || apply === "templates")
      ? (<createTemplateParams> params)["template-file"]
      : undefined;
    const content = (apply === "content")
      ? (<createContentParams> params).content || ""
      : "";
    let pluginInstance;

    if (!checkForEnabledPeriodicNoteFeature(periodicNoteType)) {
      return failure(
        ErrorCode.FeatureUnavailable,
        STRINGS[`${periodicNoteType}_note`].feature_not_available,
      );
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
    const pNote = getCurrentPeriodicNote(periodicNoteType);
    if (pNote instanceof TFile) {
      switch (ifExists) {
        // `skip` == Leave not as-is, we just return the existing note.
        case "skip":
          if (shouldFocusNote) await focusOrOpenFile(pNote.path);
          return await getNoteDetails(pNote.path);

        // Overwrite the existing note.
        case "overwrite":
          // Delete existing note, but keep going afterwards.
          await this.app.vault.trash(pNote, false);
          break;

        default:
          return failure(
            ErrorCode.NoteAlreadyExists,
            STRINGS[`${periodicNoteType}_note`].create_note_already_exists,
          );
      }
    }

    // There is no note for today.  Let's create one!
    const newNote = await createPeriodicNote(periodicNoteType);
    if (!(newNote instanceof TFile)) {
      return failure(ErrorCode.UnableToWrite, STRINGS.unable_to_write_note);
    }
    const filepath = newNote.path;
    await pause(200);

    switch (apply) {
      case "content":
        if (content !== "") {
          await createOrOverwriteNote(filepath, content);
        }
        break;

      // Testing for existence of template file is done by a zod schema, so we can
      // be sure the file exists.
      case "templater":
        await pluginInstance.write_template_to_file(templateFile, newNote);
        break;

      // Testing for existence of template file is done by a zod schema, so we can
      // be sure the file exists.
      case "templates":
        await applyCorePluginTemplate(templateFile!, newNote);
        break;
    }

    if (shouldFocusNote) await focusOrOpenFile(filepath);
    return await getNoteDetails(filepath);
  };
}

function getHandleAppend(periodicNoteType: PeriodicNoteType): HandlerFunction {
  return async function handleAppend(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    const params = <AppendParams> incomingParams;
    const { content, silent } = params;
    const belowHeadline = params["below-headline"];
    const shouldCreateNote = params["create-if-not-found"];
    const shouldEnsureNewline = params["ensure-newline"];
    const shouldFocusNote = !silent;

    // DRY: This call is used twice below, and I don't want to mess things up by
    // forgetting a parameter or something in the future.
    async function appendAsRequested(filepath: string) {
      if (belowHeadline) {
        return await appendNoteBelowHeadline(
          filepath,
          belowHeadline,
          content,
        );
      }

      return await appendNote(filepath, content, shouldEnsureNewline);
    }

    // See if the file exists, and if so, append to it.
    const resGetPath = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    if (resGetPath.isSuccess) {
      const filepath = resGetPath.result;
      const resAppend = await appendAsRequested(filepath);
      if (!resAppend.isSuccess) return resAppend;
      if (shouldFocusNote) await focusOrOpenFile(filepath);
      return success({ message: resAppend.result }, filepath);
    }

    // No, the file didn't exist. Unless it just couldn't be found (as opposed to
    // any other error), we're done.
    if (resGetPath.errorCode !== 404) return resGetPath;

    // The file didn't exist, because it hasn't been created yet. Should we create
    // it? If not, we're done.
    if (!shouldCreateNote) return resGetPath;

    // We're allowed to create the file, so let's do that.
    const newNote = await createPeriodicNote(periodicNoteType);
    if (newNote instanceof TFile) {
      const resAppend2 = await appendAsRequested(newNote.path);
      if (!resAppend2.isSuccess) return resAppend2;
      if (shouldFocusNote) await focusOrOpenFile(newNote.path);
      return success({ message: resAppend2.result }, newNote.path);
    }

    // If that didn't work, return an error.
    return failure(ErrorCode.UnableToWrite, STRINGS.unable_to_write_note);
  };
}

function getHandlePrepend(periodicNoteType: PeriodicNoteType): HandlerFunction {
  return async function handlePrepend(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    const params = <PrependParams> incomingParams;
    const { content, silent } = params;
    const belowHeadline = params["below-headline"];
    const shouldCreateNote = params["create-if-not-found"];
    const shouldEnsureNewline = params["ensure-newline"];
    const shouldFocusNote = !silent;
    const shouldIgnoreFrontMatter = params["ignore-front-matter"];

    // DRY: This call is used twice below, and I don't want to mess things up by
    // forgetting a parameter or something in the future.
    async function prependAsRequested(filepath: string) {
      if (belowHeadline) {
        return await prependNoteBelowHeadline(
          filepath,
          belowHeadline,
          content,
          shouldEnsureNewline,
        );
      }

      return await prependNote(
        filepath,
        content,
        shouldEnsureNewline,
        shouldIgnoreFrontMatter,
      );
    }

    // See if the file exists, and if so, append to it.
    const resGetPath = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    if (resGetPath.isSuccess) {
      const filepath = resGetPath.result;
      const resPrepend = await prependAsRequested(filepath);
      if (!resPrepend.isSuccess) return resPrepend;
      if (shouldFocusNote) await focusOrOpenFile(filepath);
      return success({ message: resPrepend.result }, filepath);
    }

    // No, the file didn't exist. Unless it just couldn't be found (as opposed to
    // any other error), we're done.
    if (resGetPath.errorCode !== 404) return resGetPath;

    // The file didn't exist, because it hasn't been created yet. Should we create
    // it? If not, we're done.
    if (!shouldCreateNote) return resGetPath;

    // We're allowed to create the file, so let's do that.
    const newNote = await createPeriodicNote(periodicNoteType);
    if (newNote instanceof TFile) {
      const resPrepend2 = await prependAsRequested(newNote.path);
      if (!resPrepend2.isSuccess) return resPrepend2;
      if (shouldFocusNote) await focusOrOpenFile(newNote.path);
      return success({ message: resPrepend2.result }, newNote.path);
    }

    // If that didn't work, return an error.
    return failure(ErrorCode.UnableToWrite, STRINGS.unable_to_write_note);
  };
}

function getHandleSearchStringAndReplace(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleSearchStringAndReplace(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    const { search, replace, silent } = <SearchAndReplaceParams> incomingParams;
    const shouldFocusNote = !silent;

    const resDNP = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    if (!resDNP.isSuccess) return resDNP;
    const filepath = resDNP.result;

    const res = await searchAndReplaceInNote(filepath, search, replace);
    if (!res.isSuccess) return res;
    if (shouldFocusNote) await focusOrOpenFile(filepath);
    return success({ message: res.result }, filepath);
  };
}

function getHandleSearchRegexAndReplace(
  periodicNoteType: PeriodicNoteType,
): HandlerFunction {
  return async function handleSearchRegexAndReplace(
    incomingParams: AnyParams,
  ): Promise<HandlerTextSuccess | HandlerFailure> {
    const { search, replace, silent } = <SearchAndReplaceParams> incomingParams;
    const shouldFocusNote = !silent;

    const resDNP = getExistingPeriodicNotePathIfPluginIsAvailable(
      periodicNoteType,
    );
    if (!resDNP.isSuccess) return resDNP;
    const filepath = resDNP.result;

    const resSir = parseStringIntoRegex(search);
    if (!resSir.isSuccess) return resSir;

    const res = await searchAndReplaceInNote(filepath, resSir.result, replace);
    if (!res.isSuccess) return res;
    if (shouldFocusNote) await focusOrOpenFile(filepath);
    return success({ message: res.result }, filepath);
  };
}
