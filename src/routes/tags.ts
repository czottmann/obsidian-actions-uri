import { z } from "zod";
import { AnyParams, RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import { HandlerFailure, HandlerTagsSuccess, RealLifePlugin } from "src/types";
import { success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

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
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerTagsSuccess | HandlerFailure> {
  const tags = this.app.metadataCache.getTags();

  return success({
    tags: Object.keys(tags).sort((a, b) => a.localeCompare(b)),
  });
}
