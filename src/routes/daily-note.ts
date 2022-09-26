import { z } from "zod";
import { TFile, Vault } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  createDailyNote,
  getAllDailyNotes,
  getDailyNote,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "../constants";
import { incomingBaseParams, zodOptionalBoolean } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerSuccess,
  HandlerTextSuccess,
  Route,
  SimpleResult,
  ZodSafeParsedData,
} from "../types";
import {
  appendNote,
  createOrOverwriteNote,
  getNoteContent,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import { parseStringIntoRegex } from "../utils/string-handling";

// SCHEMATA --------------------

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

export type ParamsUnion =
  | CreateParams
  | ReadParams
  | WriteParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("daily-note"),
  {
    path: "daily-note/get-current",
    schema: readParams,
    handler: handleGetCurrent,
  },
  {
    path: "daily-note/get-most-recent",
    schema: readParams,
    handler: handleGetMostRecent,
  },
  { path: "daily-note/create", schema: createParams, handler: handleCreate },
  { path: "daily-note/append", schema: appendParams, handler: handleAppend },
  { path: "daily-note/prepend", schema: prependParams, handler: handlePrepend },
  {
    path: "daily-note/search-string-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchStringAndReplace,
  },
  {
    path: "daily-note/search-regex-and-replace",
    schema: searchAndReplaceParams,
    handler: handleSearchRegexAndReplace,
  },
];

// NOTES --------------------

// Return values of `appHasDailyNotesPluginLoaded()`:
//
// - official Daily Notes on: `true`
// - official Daily Notes off: null
// - Periodic Notes Daily Notes on: `true`
// - Periodic Notes Daily Notes off: `false`

// HANDLERS --------------------

async function handleGetCurrent(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <ReadParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getCurrentDailyNote();
  if (!dailyNote) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
  }

  const res = await getNoteContent(dailyNote.path, vault);
  return res.isSuccess
    ? <HandlerFileSuccess> {
      isSuccess: true,
      result: { filepath: dailyNote.path, content: res.result },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
}

async function handleGetMostRecent(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <ReadParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const notes = getAllDailyNotes();
  const mostRecentKey = Object.keys(notes).sort().last();
  if (!mostRecentKey) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.most_recent_note_not_found,
      input: params,
    };
  }

  const dailyNote = notes[mostRecentKey];
  const res = await getNoteContent(dailyNote.path, vault);
  return res.isSuccess
    ? <HandlerFileSuccess> {
      isSuccess: true,
      result: { filepath: dailyNote.path, content: res.result },
      input: params,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.most_recent_note_not_found,
      input: params,
    };
}

async function handleCreate(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <CreateParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
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
        input: params,
      };
    }

    // We're allowed to overwrite it!  But let's not unless we got any content
    // to write.
    if (typeof content !== "string") {
      return <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.create_note_no_content,
        input: params,
      };
    }

    // We're allowed to overwrite it, and we got content to write.  Let's do it!
    const file = await createOrOverwriteNote(dailyNote.path, vault, content);
    return file
      ? <HandlerFileSuccess> {
        isSuccess: true,
        result: { filepath: dailyNote.path, content: content },
        input: params,
      }
      : <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.create_note_failed,
        input: params,
      };
  } else {
    // There is no note for today.  Let's create one!
    const newNote = await createDailyNote(window.moment());
    if (!(newNote instanceof TFile)) {
      <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.unable_to_write_note,
        input: params,
      };
    }

    // The note was written, but we need to write content to it. Do we have
    // content?  If not then we're done already.
    if (typeof content !== "string" || content === "") {
      return <HandlerFileSuccess> {
        isSuccess: true,
        result: { filepath: newNote.path, content: "" },
        input: params,
      };
    }

    // We have content to write.  Let's update the note.
    const file = await createOrOverwriteNote(newNote.path, vault, content);
    return (file instanceof TFile)
      ? <HandlerFileSuccess> {
        isSuccess: true,
        result: { filepath: newNote.path, content: content },
        input: params,
      }
      : <HandlerFailure> {
        isSuccess: false,
        error: STRINGS.daily_note.unable_to_update_note,
        input: params,
      };
  }
}

async function handleAppend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <AppendParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getCurrentDailyNote();
  if (!dailyNote) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
  }

  const res = await appendNote(
    dailyNote.path,
    vault,
    params.content,
    params["ensure-newline"],
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

async function handlePrepend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <PrependParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getCurrentDailyNote();
  if (!dailyNote) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
  }

  const res = await prependNote(
    dailyNote.path,
    vault,
    params.content,
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
  const params = <SearchAndReplaceParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getCurrentDailyNote();
  if (!dailyNote) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
  }

  const { search, replace } = params;
  const regex = new RegExp(search, "g");
  const res = await searchAndReplaceInNote(
    dailyNote.path,
    vault,
    regex,
    replace,
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

async function handleSearchRegexAndReplace(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = <SearchAndReplaceParams> incomingParams;

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getCurrentDailyNote();
  if (!dailyNote) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
      input: params,
    };
  }

  const { search, replace } = params;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: resSir.error,
      input: params,
    };
  }

  const res = await searchAndReplaceInNote(
    dailyNote.path,
    vault,
    resSir.result,
    replace,
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

// HELPERS --------------------

function getCurrentDailyNote(): TFile | undefined {
  return getDailyNote(window.moment(), getAllDailyNotes());
}
