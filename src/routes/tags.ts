import { z } from "zod";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import { HandlerFailure, HandlerTagsSuccess, RealLifePlugin } from "src/types";
import { success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

// TYPES ----------------------------------------

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
  params: ListParams,
): Promise<HandlerTagsSuccess | HandlerFailure> {
  return success({
    tags: Object.keys(this.app.metadataCache.getTags())
      .sort((a, b) => a.localeCompare(b)),
  });
}
