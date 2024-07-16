import { moment, parseFrontMatterEntry, TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { self } from "./self";
import {
  appHasPeriodPluginLoaded,
  periodicNoteFilePath,
} from "./periodic-notes-handling";
import { failure, success } from "./results-handling";
import { NoteTargetingParameterKey } from "../routes";
import { NoteTargetingComputedValues, NoteTargetingParams } from "../schemata";
import { StringResultObject } from "../types.d";
import { zodExistingNotePath } from "./zod";

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
  const keysCount = [
    NoteTargetingParameterKey.File,
    NoteTargetingParameterKey.UID,
    NoteTargetingParameterKey.PeriodicNote,
  ]
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
  let inputKey: NoteTargetingParameterKey;
  let path = "";
  if (NoteTargetingParameterKey.File in input) {
    const val = input[NoteTargetingParameterKey.File];
    inputKey = NoteTargetingParameterKey.File;
    path = val!;
  } //
  else if (NoteTargetingParameterKey.UID in input) {
    const val = input[NoteTargetingParameterKey.UID];
    inputKey = NoteTargetingParameterKey.UID;

    const res = filepathForUID(val!);
    path = res.isSuccess ? res.result : "";
  } //
  else if (input[NoteTargetingParameterKey.PeriodicNote]) {
    const val = input[NoteTargetingParameterKey.PeriodicNote]!;
    inputKey = NoteTargetingParameterKey.PeriodicNote;

    const isPluginAvailable = appHasPeriodPluginLoaded(val);
    if (!isPluginAvailable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: STRINGS[`${val}_note`].feature_not_available,
      });
      return z.NEVER;
    }

    path = periodicNoteFilePath(val, moment());
  }

  // Validate that the requested note path exists
  let tFile: TFile | undefined;
  if (path != "") {
    const resFileTest = zodExistingNotePath.safeParse(path);
    if (resFileTest.success) {
      tFile = resFileTest.data as TFile;
    }
  }

  if (!tFile && throwOnMissingNote) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: STRINGS.note_not_found,
    });
    return z.NEVER;
  }

  // Return original object plus computed values
  return {
    ...data,
    _computed: {
      inputKey: inputKey!,
      path,
      tFile,
    },
  };
}

function filepathForUID(uid: string): StringResultObject {
  const path = self().app.vault
    .getMarkdownFiles()
    .find((note) => {
      let uidValues = parseFrontMatterEntry(
        self().app.metadataCache.getFileCache(note)?.frontmatter,
        self().settings.frontmatterKey,
      );
      return [uidValues].flat().map((u) => `${u}`).includes(uid);
    })
    ?.path;

  return path ? success(path) : failure(404, STRINGS.note_not_found);
}
