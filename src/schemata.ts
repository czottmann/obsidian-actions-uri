import { z } from "zod";
import { sanitizeFilePath } from "./utils";

// These definitions are used more than once — DRY
export const zodOptionalBoolean = z.preprocess(
  (param: unknown): boolean => {
    if (typeof param === "string") {
      return (param === "false" || param === "") ? false : true;
    }
    return false;
  },
  z.boolean().optional(),
);

export const zodSanitizedFilePath = z.string()
  .transform((file) => sanitizeFilePath(file));

// NOTE: I didn't use zod's `.extend()` method because I find the VS Code lookups
// easier to read when the objects are defined using spread syntax. ¯\_(ツ)_/¯

export const basePayload = {
  action: z.string(),
  vault: z.string(),
  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
};
