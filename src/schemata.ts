import { z } from "zod";
import { zodOptionalBoolean, zodSanitizedNotePath } from "src/utils/zod";
import {
  PeriodicNoteType,
  PeriodicNoteTypeWithRecents,
} from "src/utils/periodic-notes-handling";

export const incomingBaseParams = z.object({
  action: z.string(),
  vault: z.string().min(1, { message: "can't be empty" }),

  // When enabled, the plugin will return all input call parameters as part of
  // its `x-success` or `x-error` callbacks.
  "debug-mode": zodOptionalBoolean,

  // When enabled, the plugin will not show any error notices in Obsidian. For
  // example, if a requested note isn't available, the plugin would normally
  // show a notice in Obsidian. This can be disabled by setting this to `true`.
  "hide-ui-notice-on-error": zodOptionalBoolean,

  "x-error": z.string().url().optional(),
  "x-success": z.string().url().optional(),
  "x-source": z.string().optional(),
});
export type IncomingBaseParams = z.output<typeof incomingBaseParams>;

export const noteTargetingParams = z.object({
  file: zodSanitizedNotePath.optional(),
  uid: z.string().optional(),
  "periodic-note": z.nativeEnum(PeriodicNoteType).optional(),
});
export type NoteTargetingParams = z.output<typeof noteTargetingParams>;

export const noteTargetingWithRecentsParams = z.object({
  file: zodSanitizedNotePath.optional(),
  uid: z.string().optional(),
  "periodic-note": z.nativeEnum(PeriodicNoteTypeWithRecents).optional(),
});

export type NoteTargetingWithRecentsParams = z.output<
  typeof noteTargetingWithRecentsParams
>;
