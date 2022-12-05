import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerFailure, HandlerSearchSuccess } from "../types";
import { helloRoute } from "../utils/routing";
import { doSearch } from "../utils/search";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/search": [
    helloRoute(),
    { path: "/all-notes", schema: defaultParams, handler: handleSearch },
  ],
};

// HANDLERS --------------------

async function handleSearch(
  incomingParams: AnyParams,
): Promise<HandlerSearchSuccess | HandlerFailure> {
  const params = <DefaultParams> incomingParams;
  const res = await doSearch(params.query);

  return res.isSuccess
    ? {
      isSuccess: true,
      result: res.result,
    }
    : res;
}
