import { z } from "zod";
import {
  getPeriodNotePathIfPluginIsAvailable,
  PeriodicNoteType,
} from "./periodic-notes-handling";
import { obsEnv } from "./obsidian-env";
import { zodExistingNotePath } from "./zod";
import { STRINGS } from "../constants";
import { NoteTargetingComputedValues, NoteTargetingParams } from "../schemata";

/**
 * Validates the targeting parameters of a note and adds computed values.
 *
 * This function ensures that exactly one of the specified targeting parameters
 * (`file`, `uid`, or `periodic-note`) is provided. If the validation passes,
 * it gets the requested note path based on the input and appends it to the
 * returned object.
 *
 * @param data - The input data containing targeting parameters.
 * @param ctx - The Zod refinement context used for adding validation issues.
 * @returns The input object augmented with computed values if validation
 *    succeeds; otherwise, it triggers a Zod validation error.
 * @throws {ZodError} If more than one or none of the targeting parameters are
 *    provided.
 *
 * @template T - The type of the input data.
 */
export function softValidateNoteTargetingAndResolvePath<T>(
  data: T,
  ctx: z.RefinementCtx,
): T & NoteTargetingComputedValues {
  return validateNoteTargetingAndResolvePath(data, ctx, false);
}

/**
 * Validates the targeting parameters of a note and adds computed values.
 * Triggers a Zod validation error if the requested note path does not exist.
 *
 * This function ensures that exactly one of the specified targeting parameters
 * (`file`, `uid`, or `periodic-note`) is provided. If the validation passes,
 * it gets the requested note path based on the input and appends it to the
 * returned object.
 *
 * @param data - The input data containing targeting parameters.
 * @param ctx - The Zod refinement context used for adding validation issues.
 * @returns The input object augmented with computed values if validation
 *    succeeds; otherwise, it triggers a Zod validation error. Also triggers a
 *    Zod validation error if the note path does not exist.
 * @throws {ZodError} If more than one or none of the targeting parameters are
 *    provided.
 *
 * @template T - The type of the input data.
 */
export function hardValidateNoteTargetingAndResolvePath<T>(
  data: T,
  ctx: z.RefinementCtx,
): T & NoteTargetingComputedValues {
  return validateNoteTargetingAndResolvePath(data, ctx, true);
}

// -----------------------------------------------------------------------------

/**
 * Validates the targeting parameters of a note and adds computed values.
 *
 * This function ensures that exactly one of the specified targeting parameters
 *  (`file`, `uid`, or `periodic-note`) is provided. If the validation passes,
 * it gets the requested note path based on the input and appends it to the
 * returned object.
 *
 * @param data - The input data containing targeting parameters.
 * @param ctx - The Zod refinement context used for adding validation issues.
 * @returns The input object augmented with computed values if validation
 * succeeds; otherwise, it triggers a Zod validation error.
 * @throws {ZodError} If more than one or none of the targeting parameters are provided.
 *
 * @template T - The type of the input data.
 */
function validateNoteTargetingAndResolvePath<T>(
  data: T,
  ctx: z.RefinementCtx,
  throwOnMissingNote: boolean,
): T & NoteTargetingComputedValues {
  const input = data as NoteTargetingParams;

  // Validate that only one of the three keys is present
  const keysCount = ["file", "uid", "periodic-note"]
    .filter((key) => key in input)
    .length;

  if (keysCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: STRINGS.faulty_note_targeting,
    });
    return z.NEVER;
  }

  // Get the requested file path
  let inputKey = "";
  let path = "";
  if (input.file) {
    inputKey = "file";
    path = input.file;
  } else if (input.uid) {
    inputKey = "uid";
    path = filepathForUID(input.uid);
  } else if (input["periodic-note"]) {
    inputKey = "periodic-note";
    path = filepathForPeriodicNote(input["periodic-note"]);
  }

  const _computed = {
    inputKey,
    path,
    pathExists: zodExistingNotePath.safeParse(path).success,
  };

  if (throwOnMissingNote && !_computed.pathExists) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: STRINGS.note_not_found,
    });
    return z.NEVER;
  }

  // Return original object plus computed values
  return { ...data, _computed };
}

function filepathForUID(uid: string): string {
  const hash = Object.entries(obsEnv.app.metadataCache.metadataCache)
    .find(([_, cached]) =>
      cached.frontmatter?.uid &&
      [cached.frontmatter.uid].flat().map((u) => `${u}`).includes(uid)
    )
    ?.[0];

  const filePath = Object.entries(obsEnv.app.metadataCache.fileCache)
    .find(([_, cache]) => cache.hash === hash)
    ?.[0];

  return filePath || "";
}

function filepathForPeriodicNote(periodicID: PeriodicNoteType): string {
  const res = getPeriodNotePathIfPluginIsAvailable(periodicID);
  return res.isSuccess ? res.result : "";
}
