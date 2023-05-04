import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerSearchSuccess,
  HandlerTextSuccess,
} from "../types";
import { helloRoute } from "../utils/routing";
import { doOmnisearch } from "../utils/search";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

const openParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});
type OpenParams = z.infer<typeof openParams>;

export type AnyLocalParams =
  | DefaultParams
  | OpenParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/omnisearch": [
    helloRoute(),
    { path: "/all-notes", schema: defaultParams, handler: handleSearch },
    { path: "/open", schema: openParams, handler: handleOpen },
  ],
};

// HANDLERS --------------------

async function handleSearch(
  incomingParams: AnyParams,
): Promise<HandlerSearchSuccess | HandlerFailure> {
  const params = <DefaultParams> incomingParams;
  const res = await doOmnisearch(params.query);

  return res.isSuccess
    ? {
      isSuccess: true,
      result: res.result,
    }
    : res;
}

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess> {
  const params = <DefaultParams> incomingParams;

  // Let's open the search in the simplest way possible.
  window.open(
    "obsidian://omnisearch?" +
      "vault=" + encodeURIComponent(window.app.vault.getName()) +
      "&query=" + encodeURIComponent(params.query.trim()),
  );

  return {
    isSuccess: true,
    result: { message: "Opened search" },
  };
}