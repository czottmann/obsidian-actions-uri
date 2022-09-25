import { z } from "zod";
import { incomingBaseParams } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});

export type ParamsUnion = z.infer<typeof defaultParams>;

// ROUTES --------------------

export const routes: Route[] = [
  { path: "search", schema: defaultParams, handler: handleSearch },
];

// HANDLERS --------------------

// TODO: handleSearch()
async function handleSearch(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const params = incomingParams as z.infer<typeof defaultParams>;
  console.log("handleSearch", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}
