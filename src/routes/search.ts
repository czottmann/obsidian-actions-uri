import { z } from "zod";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerSearchSuccess,
  HandlerTextSuccess,
  RealLifePlugin,
} from "src/types";
import { success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";
import { doSearch } from "src/utils/search";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const openParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});

// TYPES ----------------------------------------

type DefaultParams = z.infer<typeof defaultParams>;
type OpenParams = z.infer<typeof openParams>;

export type AnyLocalParams =
  | DefaultParams
  | OpenParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/search": [
    helloRoute(),
    { path: "/all-notes", schema: defaultParams, handler: handleSearch },
    { path: "/open", schema: openParams, handler: handleOpen },
  ],
};

// HANDLERS --------------------

async function handleSearch(
  params: DefaultParams,
): Promise<HandlerSearchSuccess | HandlerFailure> {
  const res = await doSearch(params.query);
  return res.isSuccess ? success(res.result) : res;
}

async function handleOpen(
  this: RealLifePlugin,
  params: DefaultParams,
): Promise<HandlerTextSuccess> {
  // Let's open the search in the simplest way possible.
  window.open(
    "obsidian://search?" +
      "vault=" + encodeURIComponent(this.app.vault.getName()) +
      "&query=" + encodeURIComponent(params.query.trim()),
  );

  return success({ message: "Opened search" });
}
