import { z } from "zod";
import { sanitizeFilePath } from "./utils/file-handling";

export const basePayloadSchema = {
  action: z.string(),
  vault: z.string().min(1, { message: "can't be empty" }),
  id: z.string().optional(),
  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
};

export const basePayload = z.object(basePayloadSchema);

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
