import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerTagsSuccess,
  RealLifeMetadataCache,
} from "../types";
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
  const tags = (<RealLifeMetadataCache> app.metadataCache).getTags();

  return {
    isSuccess: true,
    result: {
      tags: Object.keys(tags).sort((a, b) => a.localeCompare(b)),
    },
  };
}
