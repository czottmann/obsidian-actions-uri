import { z } from "zod";
import { AnyParams, Route } from "../routes";
import { incomingBaseParams } from "../schemata";
import { AnyHandlerResult, HandlerFailure, HandlerTextSuccess } from "../types";
import { namespaceRoutes } from "../utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});

export type AnyLocalParams = z.infer<typeof defaultParams>;

// ROUTES --------------------

export const routes: Route[] = namespaceRoutes("search", [
  { path: "", schema: defaultParams, handler: handleSearch },
]);

// HANDLERS --------------------

// TODO: handleSearch()
async function handleSearch(
  incomingParams: AnyParams,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof defaultParams>;
  console.log("handleSearch", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}
