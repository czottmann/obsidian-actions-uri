import { parseFrontMatterEntry, TAbstractFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { sanitizeFilePathAndGetAbstractFile } from "src/utils/file-handling";
import { self } from "src/utils/self";
import {
  checkForEnabledPeriodicNoteFeature,
  getCurrentPeriodicNotePath,
  getMostRecentPeriodicNotePath,
  PeriodicNoteType,
  PeriodicNoteTypeWithRecents,
} from "src/utils/periodic-notes-handling";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { NoteTargetingParameterKey } from "src/routes";
import { NoteTargetingParams } from "src/schemata";
import { StringResultObject } from "src/types.d";

// TYPES ----------------------------------------

type ResolvedData = {
  _resolved: Record<string, any>;
};

export type ResolvedNoteTargetingValues = Readonly<{
  _resolved: {
    inputKey: NoteTargetingParameterKey;
    inputPath: string;
    inputFile: TAbstractFile | undefined;
  };
}>;

// RESOLVERS ----------------------------------------

/**
 * Validates the note targeting parameters and adds computed values to the
 * input object (under the `_resolved` key).
 *
 * This function ensures that exactly one of the specified targeting parameters
 *  (`file`, `uid`, or `periodic-note`) is provided. If the validation passes,
 * it gets the requested note path based on the input and appends it to the
 * returned object.
 *
 * @param data - The input data containing targeting parameters.
 * @param ctx - The Zod refinement context used for adding validation issues.
 * @param throwOnMissingNote - Whether to throw a Zod validation error if the
 * requested note path does not exist. Defaults to `false`.
 * @returns The input object augmented with computed values if validation
 * succeeds; otherwise, it triggers a Zod validation error.
 * @throws {ZodError} When more than one or none of the targeting parameters are provided.
 *
 * @template T - The type of the input data.
 */
export function resolveNoteTargeting<T>(
  data: T,
  ctx: z.RefinementCtx,
  throwOnMissingNote: boolean = false,
): T & ResolvedNoteTargetingValues {
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
  let inputPath = "";
  if (NoteTargetingParameterKey.File in input) {
    const val = input[NoteTargetingParameterKey.File]!;
    inputKey = NoteTargetingParameterKey.File;
    inputPath = val;
  } //
  else if (NoteTargetingParameterKey.UID in input) {
    const val = input[NoteTargetingParameterKey.UID]!;
    inputKey = NoteTargetingParameterKey.UID;

    const res = filepathForUID(val);
    inputPath = res.isSuccess ? res.result : "";
  } //
  else if (input[NoteTargetingParameterKey.PeriodicNote]) {
    const val = input[
      NoteTargetingParameterKey.PeriodicNote
    ]! as unknown as PeriodicNoteTypeWithRecents;
    inputKey = NoteTargetingParameterKey.PeriodicNote;

    const periodicNoteType = val.replace(/^recent-/, "") as PeriodicNoteType;
    const shouldFindMostRecent = val.startsWith("recent-");

    // Normalize "recent-daily" into "daily" etc. then check feature availability
    const isPluginAvailable = checkForEnabledPeriodicNoteFeature(
      periodicNoteType,
    );
    if (!isPluginAvailable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: STRINGS[`${periodicNoteType}_note`].feature_not_available,
      });
      return z.NEVER;
    }

    if (shouldFindMostRecent) {
      // Get the most recent note path
      const resRPN = getMostRecentPeriodicNotePath(periodicNoteType);
      inputPath = resRPN.isSuccess ? resRPN.result : "";
    } else {
      // Get the current note path
      inputPath = getCurrentPeriodicNotePath(periodicNoteType);
    }
  }

  // Validate that the requested note path exists
  let inputFile: TAbstractFile | undefined;
  if (inputPath != "") {
    const resFileTest = sanitizeFilePathAndGetAbstractFile(inputPath);
    if (resFileTest) {
      inputFile = resFileTest;
    }
  }

  if (!inputFile && throwOnMissingNote) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: STRINGS.note_not_found,
      path: [inputPath],
    });
    return z.NEVER;
  }

  // Return original object plus resolved values
  return mergeResolvedData(data, {
    inputKey: inputKey!,
    inputPath,
    inputFile,
  });
}

/**
 * Validates the note targeting parameters and adds computed values. Triggers a
 * Zod validation error if the requested note path does not exist.
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
export function resolveNoteTargetingStrict<T>(
  data: T,
  ctx: z.RefinementCtx,
): T & ResolvedNoteTargetingValues {
  return resolveNoteTargeting(data, ctx, true);
}

// HELPERS ----------------------------------------

/**
 * Merges the resolved values into the input object. If the input object already
 * contains a `_resolved` key, the new values are merged into it.
 */
export function mergeResolvedData<T, U>(
  data: T,
  resolved: U,
): T & { _resolved: U } {
  return {
    ...data,
    _resolved: {
      ...(data as T & ResolvedData)._resolved || {},
      ...resolved,
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

  return path
    ? success(path)
    : failure(ErrorCode.NotFound, STRINGS.note_not_found);
}
