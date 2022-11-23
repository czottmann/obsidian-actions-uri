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
  HandlerAbstractFilesSuccess,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  TFileResultObject,
} from "../types";
import {
  appendNote,
  createOrOverwriteNote,
  getCurrentDailyNote,
  getDailyNotePathIfPluginIsAvailable,
  getNoteContent,
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
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
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
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
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
    // ## `/daily-note`
    //
    // Does nothing but say hello.
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
): Promise<HandlerAbstractFilesSuccess | HandlerFailure> {
  if (!appHasDailyNotesPluginLoaded()) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.daily_notes_feature_not_available,
    };
  }

  const notes = getAllDailyNotes();
  const files = Object.keys(notes)
    .sort()
    .reverse()
    .map((k) => ({
      name: notes[k].basename,
      filepath: notes[k].path,
    }));

  return {
    isSuccess: true,
    result: {
      files,
    },
  };
}

async function handleGetCurrent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return resDNP;
  }

  const filepath = resDNP.result;
  const res = await getNoteContent(filepath);

  if (!res.isSuccess) {
    return res;
  }

  const content = res.result;
  const { body, frontMatter } = extractNoteContentParts(content);

  return {
    isSuccess: true,
    result: {
      filepath,
      content,
      body,
      "front-matter": unwrapFrontMatter(frontMatter),
    },
    processedFilepath: filepath,
  };
}

async function handleGetMostRecent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res1 = await getMostRecentDailyNote();
  if (!res1.isSuccess) {
    return res1;
  }

  const dailyNote = res1.result;
  const res2 = await getNoteContent(dailyNote.path);
  if (!res2.isSuccess) {
    return res2;
  }

  const content = res2.result;
  const { body, frontMatter } = extractNoteContentParts(content);

  return {
    isSuccess: true,
    result: {
      filepath: dailyNote.path,
      content,
      body,
      "front-matter": unwrapFrontMatter(frontMatter),
    },
    processedFilepath: dailyNote.path,
  };
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
    ? {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result,
    }
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

  if (!appHasDailyNotesPluginLoaded()) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.daily_notes_feature_not_available,
    };
  }

  const { content } = params;
  const dailyNote = getCurrentDailyNote();

  // There already is a note for today.
  if (dailyNote instanceof TFile) {
    // Back off unless we're allowed to overwrite it.
    if (!params.overwrite) {
      return {
        isSuccess: false,
        errorCode: 405,
        errorMessage: STRINGS.daily_note.create_note_already_exists,
      };
    }

    // We're allowed to overwrite it!  But let's not unless we got any content
    // to write.
    if (typeof content !== "string") {
      return {
        isSuccess: false,
        errorCode: 406,
        errorMessage: STRINGS.daily_note.create_note_no_content,
      };
    }

    // We're allowed to overwrite it, and we got content to write.  Let's do it!
    const resFile = await createOrOverwriteNote(dailyNote.path, content);
    return resFile.isSuccess
      ? {
        isSuccess: true,
        result: { content, filepath: dailyNote.path },
        processedFilepath: dailyNote.path,
      }
      : resFile;
  }

  // There is no note for today.  Let's create one!
  const newNote = await createDailyNote(window.moment());
  if (!(newNote instanceof TFile)) {
    return {
      isSuccess: false,
      errorCode: 400,
      errorMessage: STRINGS.unable_to_write_note,
    };
  }

  // The note was written, but we need to write content to it. Do we have
  // content?  If not then we're done already.
  if (typeof content !== "string" || content === "") {
    return {
      isSuccess: true,
      result: { content: "", filepath: newNote.path },
      processedFilepath: newNote.path,
    };
  }

  // We have content to write.  Let's update the note.
  const resFile = await createOrOverwriteNote(newNote.path, content);
  return resFile.isSuccess
    ? {
      isSuccess: true,
      result: { content, filepath: newNote.path },
      processedFilepath: newNote.path,
    }
    : resFile;
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return resDNP;
  }

  const filepath = resDNP.result;
  const res = await appendNote(
    filepath,
    params.content,
    params["ensure-newline"],
  );

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : res;
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return resDNP;
  }

  const filepath = resDNP.result;
  const res = await prependNote(
    filepath,
    params.content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : res;
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

  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : res;
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
  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : res;
}

// HELPERS -------------------------------------

async function getMostRecentDailyNote(): Promise<TFileResultObject> {
  if (!appHasDailyNotesPluginLoaded()) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.daily_notes_feature_not_available,
    };
  }

  const notes = getAllDailyNotes();
  const mostRecentKey = Object.keys(notes).sort().last();
  if (!mostRecentKey) {
    return {
      isSuccess: false,
      errorCode: 404,
      errorMessage: STRINGS.note_not_found,
    };
  }

  const dailyNote = notes[mostRecentKey];
  return await getNoteFile(dailyNote.path);
}
