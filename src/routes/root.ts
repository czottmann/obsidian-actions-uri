import { z } from "zod";
import { basePayload } from "../schemata";
import { AnyResult, Route, SuccessfulStringResult } from "../types";
import { showBrandedNotice } from "../utils";

// SCHEMATA --------------------

const IncomingBasePayload = z.object(basePayload);

export type PayloadUnion = z.infer<typeof IncomingBasePayload>;

// ROUTES --------------------

export const routes: Route[] = [
  { path: "", schema: IncomingBasePayload, handler: handleRoot },
];

// HANDLERS --------------------

async function handleRoot(payload: {}): Promise<AnyResult> {
  showBrandedNotice("… is ready for action 🚀");
  return <SuccessfulStringResult> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
