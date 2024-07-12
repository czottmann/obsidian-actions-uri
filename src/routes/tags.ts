import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerFailure, HandlerTagsSuccess } from "../types";
import { self } from "../utils/self";
import { success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

export type AnyLocalParams = ListParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/tags": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  incomingParams: AnyParams,
): Promise<HandlerTagsSuccess | HandlerFailure> {
  const tags = self().app.metadataCache.getTags();

  return success({
    tags: Object.keys(tags).sort((a, b) => a.localeCompare(b)),
  });
}
