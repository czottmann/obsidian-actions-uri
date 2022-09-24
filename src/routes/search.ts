import { z } from "zod";
import { basePayload } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerTextSuccess,
  Route,
  ZodSafeParseSuccessData,
} from "../types";

// SCHEMATA --------------------

const SearchPayload = z.object({
  ...basePayload,
  query: z.string().min(1, { message: "can't be empty" }),
});

export type PayloadUnion = z.infer<typeof SearchPayload>;

// ROUTES --------------------

export const routes: Route[] = [
  { path: "search", schema: SearchPayload, handler: handleSearch },
];

// HANDLERS --------------------

// TODO: handleSearch()
async function handleSearch(
  data: ZodSafeParseSuccessData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchPayload>;
  console.log("handleSearch", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
