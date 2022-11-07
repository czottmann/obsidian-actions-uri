import { z } from "zod";
import { zodOptionalBoolean } from "./utils/zod";

export const incomingBaseParams = z.object({
  action: z.string(),
  vault: z.string().min(1, { message: "can't be empty" }),

  // When enabled, the plugin will return all input call parameters as part of
  // its `x-success` or `x-error` callbacks.
  "debug-mode": zodOptionalBoolean,

  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
});
export type IncomingBaseParams = z.infer<typeof incomingBaseParams>;
