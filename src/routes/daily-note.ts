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
import { createOrOverwriteNote, getNoteContent } from "../utils/file-handling";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------

const readParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});

const prependParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

export type ParamsUnion =
  | z.infer<typeof createParams>
  | z.infer<typeof readParams>
  | z.infer<typeof writeParams>
  | z.infer<typeof appendParams>
  | z.infer<typeof prependParams>;

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
];

// HANDLERS --------------------

async function handleGetCurrent(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof readParams>;

  // - official Daily Notes on: `true`
  // - official Daily Notes off: null
  // - Periodic Notes Daily Notes on: `true`
  // - Periodic Notes Daily Notes off: `false`

  if (!appHasDailyNotesPluginLoaded()) {
    return <HandlerFailure> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
      input: params,
    };
  }

  const dailyNote = getDailyNote(window.moment(), getAllDailyNotes());
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
      result: {
        filepath: dailyNote.path,
        content: res.result,
      },
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
  const params = incomingParams as z.infer<typeof readParams>;

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
  const params = incomingParams as z.infer<typeof createParams>;
  const { content } = params;
  const dailyNote = getDailyNote(window.moment(), getAllDailyNotes());

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
      return <HandlerTextSuccess> {
        isSuccess: true,
        result: { message: newNote.path },
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

// TODO: handleAppend()
async function handleAppend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof writeParams>;
  console.log("handlePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handlePrepend()
async function handlePrepend(
  incomingParams: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof writeParams>;
  console.log("handlePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}
