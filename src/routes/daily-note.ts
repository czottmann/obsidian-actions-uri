import { z } from "zod";
import { TFile } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  createDailyNote,
  getAllDailyNotes,
} from "obsidian-daily-notes-interface";
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
  createOrOverwriteNote,
  getCurrentDailyNote,
  getDailyNotePathIfPluginIsAvailable,
  getNoteContent,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { helloRoute, namespaceRoutes } from "../utils/routing";
import {
  extractNoteContentParts,
  parseStringIntoRegex,
  unwrapFrontMatter,
} from "../utils/string-handling";
import { zodOptionalBoolean } from "../utils/zod";

// SCHEMATA ----------------------------------------

const readParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

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
  | ReadParams
  | CreateParams
  | WriteParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES ----------------------------------------

export const routes: Route[] = namespaceRoutes("daily-note", [
  // ## `/daily-note`
  //
  // Does nothing but say hello.
  helloRoute(),

  // ## `/daily-note/get-current`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     action: string;
  //     vault: string;
  //     "x-error": string;
  //     "x-success": string;
  // }
  // => HandlerFileSuccess | HandlerFailure
  { path: "get-current", schema: readParams, handler: handleGetCurrent },

  // ## `/daily-note/get-most-recent`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error": string;
  //     "x-success": string;
  //     action: string;
  //     vault: string;
  // }
  // => HandlerFileSuccess | HandlerFailure
  { path: "get-most-recent", schema: readParams, handler: handleGetMostRecent },

  // ## `/daily-note/create`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error"?: string | undefined;
  //     "x-success"?: string | undefined;
  //     action: string;
  //     content?: string | undefined;
  //     overwrite?: boolean | undefined;
  //     silent?: boolean | undefined;
  //     vault: string;
  // }
  // => HandlerFileSuccess | HandlerFailure
  { path: "create", schema: createParams, handler: handleCreate },

  // ## `/daily-note/append`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "ensure-newline"?: boolean | undefined;
  //     "x-error"?: string | undefined;
  //     "x-success"?: string | undefined;
  //     action: string;
  //     content: string;
  //     silent?: boolean | undefined;
  //     vault: string;
  // }
  // => HandlerTextSuccess | HandlerFailure
  { path: "append", schema: appendParams, handler: handleAppend },

  // ## `/daily-note/prepend`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "ensure-newline"?: boolean | undefined;
  //     "x-error"?: string | undefined;
  //     "x-success"?: string | undefined;
  //     action: string;
  //     content: string;
  //     silent?: boolean | undefined;
  //     vault: string;
  // }
  // => HandlerTextSuccess | HandlerFailure
  { path: "prepend", schema: prependParams, handler: handlePrepend },

  // ## `/daily-note/search-string-and-replace`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error"?: string | undefined;
  //     "x-success"?: string | undefined;
  //     action: string;
  //     replace: string;
  //     search: string;
  //     silent?: boolean | undefined;
  //     vault: string;
  // }
  // => HandlerTextSuccess | HandlerFailure
  {
    path: "search-string-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchStringAndReplace,
  },

  // ## `/daily-note/search-regex-and-replace`
  //
  // TODO
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error"?: string | undefined;
  //     "x-success"?: string | undefined;
  //     action: string;
  //     replace: string;
  //     search: string;
  //     silent?: boolean | undefined;
  //     vault: string;
  // }
  // => HandlerTextSuccess | HandlerFailure
  {
    path: "search-regex-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchRegexAndReplace,
  },
]);

// HANDLERS ----------------------------------------

async function handleGetCurrent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resDNP.error,
    };
  }

  const filepath = resDNP.result;
  const res = await getNoteContent(filepath);

  if (res.isSuccess) {
    const content = res.result;
    const { body, frontMatter } = extractNoteContentParts(content);

    return <HandlerFileSuccess> {
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

  return <HandlerFailure> {
    isSuccess: false,
    error: STRINGS.daily_note.current_note_not_found,
  };
}

async function handleGetMostRecent(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
    };
  }

  const notes = getAllDailyNotes();
  const mostRecentKey = Object.keys(notes).sort().last();
  if (!mostRecentKey) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.most_recent_note_not_found,
    };
  }

  const dailyNote = notes[mostRecentKey];
  const res = await getNoteContent(dailyNote.path);

  if (res.isSuccess) {
    const content = res.result;
    const { body, frontMatter } = extractNoteContentParts(content);

    return <HandlerFileSuccess> {
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

  return <HandlerFailure> {
    isSuccess: false,
    error: STRINGS.daily_note.most_recent_note_not_found,
  };
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
    };
  }

  const { content } = params;
  const dailyNote = getCurrentDailyNote();

  // There already is a note for today.
  if (dailyNote instanceof TFile) {
    // Back off unless we're allowed to overwrite it.
    if (!params.overwrite) {
      return <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.create_note_already_exists,
      };
    }

    // We're allowed to overwrite it!  But let's not unless we got any content
    // to write.
    if (typeof content !== "string") {
      return <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.create_note_no_content,
      };
    }

    // We're allowed to overwrite it, and we got content to write.  Let's do it!
    const file = await createOrOverwriteNote(dailyNote.path, content);
    return file
      ? <HandlerFileSuccess> {
        isSuccess: true,
        result: { content, filepath: dailyNote.path },
        processedFilepath: dailyNote.path,
      }
      : <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.create_note_failed,
      };
  } else {
    // There is no note for today.  Let's create one!
    const newNote = await createDailyNote(window.moment());
    if (!(newNote instanceof TFile)) {
      <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.unable_to_write_note,
      };
    }

    // The note was written, but we need to write content to it. Do we have
    // content?  If not then we're done already.
    if (typeof content !== "string" || content === "") {
      return <HandlerFileSuccess> {
        isSuccess: true,
        result: { content: "", filepath: newNote.path },
        processedFilepath: newNote.path,
      };
    }

    // We have content to write.  Let's update the note.
    const file = await createOrOverwriteNote(newNote.path, content);
    return (file instanceof TFile)
      ? <HandlerFileSuccess> {
        isSuccess: true,
        result: { content, filepath: newNote.path },
        processedFilepath: newNote.path,
      }
      : <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.unable_to_update_note,
      };
  }
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resDNP.error,
    };
  }

  const filepath = resDNP.result;
  const res = await appendNote(
    filepath,
    params.content,
    params["ensure-newline"],
  );

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resDNP.error,
    };
  }

  const filepath = resDNP.result;
  const res = await prependNote(
    filepath,
    params.content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resDNP.error,
    };
  }

  const filepath = resDNP.result;
  const regex = new RegExp(params.search, "g");
  const res = await searchAndReplaceInNote(
    filepath,
    regex,
    params.replace,
  );
  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const resDNP = getDailyNotePathIfPluginIsAvailable();
  if (!resDNP.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resDNP.error,
    };
  }

  const resSir = parseStringIntoRegex(params.search);
  if (!resSir.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resSir.error,
    };
  }

  const filepath = resDNP.result;
  const res = await searchAndReplaceInNote(
    filepath,
    resSir.result,
    params.replace,
  );
  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: filepath,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

// NOTES ----------------------------------------

// Return values of `appHasDailyNotesPluginLoaded()`:
//
// - official Daily Notes on: `true`
// - official Daily Notes off: null
// - Periodic Notes Daily Notes on: `true`
// - Periodic Notes Daily Notes off: `false`
