import { z } from "zod";
import { incomingBaseParams } from "../schemata";
import { AnyParams, Route } from "../routes";
import { AnyHandlerResult, HandlerFailure, HandlerTextSuccess } from "../types";
import {
  getDailyNotePathIfPluginIsAvailable,
  getNoteFile,
} from "../utils/file-handling";
import { helloRoute, namespaceRoutes } from "../utils/routing";
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

export const routes: Route[] = namespaceRoutes("open", [
  helloRoute(),
  {
    path: "daily-note",
    schema: dailyNoteParams,
    handler: handleDailyNote,
  },
  { path: "note", schema: noteParams, handler: handleNote },
  { path: "search", schema: searchParams, handler: handleSearch },
]);

// HANDLERS --------------------

/**
 * Since we force the `silent` param to be `false` (see section "SCHEMATA"
 * above), all these handlers need to do is find the requested note path and
 * hand it back to the calling `handleIncomingCall()` (see `main.ts`) which will
 * take care of the rest.
 */

async function handleDailyNote(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <DailyNoteParams> incomingParams;
  const res = getDailyNotePathIfPluginIsAvailable();
  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

async function handleNote(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <NoteParams> incomingParams;
  const res = await getNoteFile(params.file);
  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: STRINGS.open.note_opened },
      processedFilepath: res.result.path,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}

async function handleSearch(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = <SearchParams> incomingParams;

  // Let's open the search in the simplest way possible.
  window.open(
    "obsidian://search?" +
      "vault=" + encodeURIComponent(global.app.vault.getName()) +
      "&query=" + encodeURIComponent(params.query.trim()),
  );

  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "Opened search" },
  };
}
