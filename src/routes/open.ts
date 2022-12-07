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
    helloRoute(),
    { path: "/search", schema: searchParams, handler: handleSearch },
  ],
};

// HANDLERS --------------------

async function handleSearch(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess> {
  const params = <SearchParams> incomingParams;

  // Let's open the search in the simplest way possible.
  window.open(
    "obsidian://search?" +
      "vault=" + encodeURIComponent(window.app.vault.getName()) +
      "&query=" + encodeURIComponent(params.query.trim()),
  );

  return {
    isSuccess: true,
    result: { message: "Opened search" },
  };
}
