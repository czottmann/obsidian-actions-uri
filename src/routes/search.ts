import { z } from "zod";
import { basePayload } from "../schemata";
import {
  AnyResult,
  Route,
  SuccessfulStringResult,
  UnsuccessfulResult,
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
async function handleSearch(data: ZodSafeParseSuccessData): Promise<AnyResult> {
  const payload = data as z.infer<typeof SearchPayload>;
  console.log("handleSearch", payload);
  return <SuccessfulStringResult> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
