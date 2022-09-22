import { z } from "zod";
import { sanitizeFilePath } from "./utils";

function urlParameterToBoolean(param: unknown): boolean {
  if (typeof param === "string") {
    return (param === "false" || param === "") ? false : true;
  }
  return false;
}

// These definitions are used more than once — DRY
const optionalBoolean = z.preprocess(
  (param: unknown): boolean => {
    if (typeof param === "string") {
      return (param === "false" || param === "") ? false : true;
    }
    return false;
  },
  z.boolean().optional(),
);

const sanitizedFilePath = z.string()
  .transform((file) => sanitizeFilePath(file));

// NOTE: I didn't use zod's `.extend()` method because I find the VS Code lookups
// easier to read when the objects are defined using spread syntax. ¯\_(ツ)_/¯

const basePayload = {
  action: z.string(),
  vault: z.string(),
  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
};

export const IncomingBasePayload = z.object(basePayload);

export const DailyNoteCreatePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  overwrite: optionalBoolean,
  silent: optionalBoolean,
});

export const DailyNoteReadPayload = z.object({
  ...basePayload,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

export const DailyNoteWritePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  silent: optionalBoolean,
});

export const NoteCreatePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  file: sanitizedFilePath,
  overwrite: optionalBoolean,
  silent: optionalBoolean,
});

export const NoteReadPayload = z.object({
  ...basePayload,
  file: sanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

export const NoteWritePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  file: sanitizedFilePath,
  silent: optionalBoolean,
});

export const OpenDailyNotePayload = z.object(basePayload);
export const OpenNotePayload = z.object(basePayload);
export const OpenSearchPayload = z.object({
  ...basePayload,
  query: z.string(),
});
