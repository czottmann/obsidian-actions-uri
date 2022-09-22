import { z } from "zod";
import { basePayload } from "../schemata";
import { Route, ZodSafeParseSuccessData } from "../types";

// SCHEMATA --------------------

const SearchPayload = z.object({
  ...basePayload,
  query: z.string(),
});

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: "search",
    schema: SearchPayload,
    handler: handleSearch,
  },
  // --------------------
];

// HANDLERS --------------------

function handleSearch(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof SearchPayload>;
  console.log("handleSearch", payload);
}
