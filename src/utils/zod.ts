import { z } from "zod";
import { sanitizeFilePath } from "./file-handling";

// The absence of a parameter `blah`, a `blah=false` and a value-less `blah=`
// should all be treated as `false`. My reign shall be merciful.
export const zodOptionalBoolean = z.preprocess(
  (param: unknown): boolean => {
    if (typeof param === "string") {
      return param !== "false" && param !== "";
    }
    return false;
  },
  z.boolean().optional(),
);

export const zodSanitizedFilePath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file));
