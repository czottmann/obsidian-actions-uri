import { z } from "zod";
import { sanitizeFilePath } from "./utils";

export const basePayload = {
  action: z.string(),
  vault: z.string().min(1, { message: "can't be empty" }),
  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
};

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
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file));
