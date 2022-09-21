import { z } from "zod";
import { sanitizeFilePath } from "./utils";

// Referenz für Parameter-Namen:
// https://help.obsidian.md/Advanced+topics/Using+obsidian+URI

export const IncomingBasePayload = z.object({
  action: z.string(),
  vault: z.string(),
  silent: z.string().optional(),
  "x-success": z.string().url().optional(),
  "x-error": z.string().url().optional(),
});

export const DailyNoteOpenPayload = IncomingBasePayload;

export const DailyNoteReadPayload = IncomingBasePayload.extend({
  "x-success": z.string().url(),
  "x-error": z.string().url(),
});

export const DailyNoteWritePayload = IncomingBasePayload.extend({
  content: z.string().optional(),
});

export const NoteOpenPayload = IncomingBasePayload;

export const NoteReadPayload = IncomingBasePayload.extend({
  file: z.string().transform((file) => sanitizeFilePath(file)),
  "x-success": z.string().url(),
  "x-error": z.string().url(),
});

export const NoteWritePayload = IncomingBasePayload.extend({
  file: z.string().transform((file) => sanitizeFilePath(file)),
  content: z.string().optional(),
});
