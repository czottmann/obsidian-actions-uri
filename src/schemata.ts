import { TFile } from "obsidian";
import { z } from "zod";
import { NoteTargetingParameterKey } from "./routes";
import { zodOptionalBoolean, zodSanitizedNotePath } from "./utils/zod";
import { PeriodicNoteType } from "./utils/periodic-notes-handling";

export const incomingBaseParams = z.object({
  action: z.string(),
  vault: z.string().min(1, { message: "can't be empty" }),

  // When enabled, the plugin will return all input call parameters as part of
  // its `x-success` or `x-error` callbacks.
  "debug-mode": zodOptionalBoolean,

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

export type NoteTargetingComputedValues = Readonly<{
  _computed: {
    inputKey: NoteTargetingParameterKey;
    path: string;
    tFile: TFile | undefined;
  };
}>;
