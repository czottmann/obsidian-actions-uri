import { z } from "zod";
import { incomingBaseParams } from "../schemata";
import { AnyParams, RoutePath } from "../routes";
import { HandlerFailure, HandlerTextSuccess } from "../types";
import {
  getDailyNotePathIfPluginIsAvailable,
  getNoteFile,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import { STRINGS } from "../constants";
import { zodAlwaysFalse, zodSanitizedFilePath } from "../utils/zod";

// SCHEMATA --------------------

const dailyNoteParams = incomingBaseParams.extend({
  silent: zodAlwaysFalse,
});
type DailyNoteParams = z.infer<typeof dailyNoteParams>;

const noteParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodAlwaysFalse,
});
type NoteParams = z.infer<typeof noteParams>;

const searchParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
  silent: zodAlwaysFalse,
});
type SearchParams = z.infer<typeof searchParams>;

export type AnyLocalParams =
  | DailyNoteParams
  | NoteParams
  | SearchParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/open": [
    // ## `/open`
    //
    // Does nothing but say hello.
    helloRoute(),

    // ## `/open/daily-note`
    //
    // Opens today's daily note in Obsidian.
    //
    //   {
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    { path: "/daily-note", schema: dailyNoteParams, handler: handleDailyNote },

    // ## `/open/note`
    //
    // Opens a particular note in Obsidian.
    //
    //   {
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     file: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    { path: "/note", schema: noteParams, handler: handleNote },

    // ## `/open/search`
    //
    // Opens the search for a given query in Obsidian.
    //
    //   {
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     query: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess
    { path: "/search", schema: searchParams, handler: handleSearch },
  ],
};

// HANDLERS --------------------

/**
 * Since we force the `silent` param to be `false` (see section "SCHEMATA"
 * above), all these handlers need to do is find the requested note path and
 * hand it back to the calling `handleIncomingCall()` (see `main.ts`) which will
 * take care of the rest.
 */

async function handleDailyNote(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <DailyNoteParams> incomingParams;
  const res = getDailyNotePathIfPluginIsAvailable();
  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result,
    }
    : res;
}

async function handleNote(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <NoteParams> incomingParams;
  const res = await getNoteFile(params.file);
  return res.isSuccess
    ? {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result.path,
    }
    : res;
}

async function handleSearch(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess> {
  const params = <SearchParams> incomingParams;

  // Let's open the search in the simplest way possible.
  window.open(
    "obsidian://search?" +
      "vault=" + encodeURIComponent(global.app.vault.getName()) +
      "&query=" + encodeURIComponent(params.query.trim()),
  );

  return {
    isSuccess: true,
    result: { message: "Opened search" },
  };
}
