import { TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { incomingBaseParams } from "src/schemata";
import { HandlerFailure, HandlerFileSuccess, RealLifePlugin } from "src/types";
import {
  applyCorePluginTemplate,
  createNote,
  createOrOverwriteNote,
  getNoteDetails,
  trashFilepath,
} from "src/utils/file-handling";
import {
  createPeriodNote,
  PeriodicNoteType,
} from "src/utils/periodic-notes-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "src/utils/plugins";
import { resolveNoteTargeting } from "src/utils/parameters";
import { ErrorCode, failure } from "src/utils/results-handling";
import { focusOrOpenFile } from "src/utils/ui";
import {
  zodExistingTemplaterPath,
  zodExistingTemplatesPath,
  zodOptionalBoolean,
  zodSanitizedNotePath,
} from "src/utils/zod";

// TYPES ----------------------------------------

enum CreateApplyParameterValue {
  Content = "content",
  Templater = "templater",
  Templates = "templates",
}

export enum IfExistsParameterValue {
  Default = "",
  Overwrite = "overwrite",
  Skip = "skip",
}

// SCHEMAS ----------------------------------------

const createStandardNoteParams = incomingBaseParams
  .extend({
    file: zodSanitizedNotePath,
    "if-exists": z.nativeEnum(IfExistsParameterValue).optional(),
    silent: zodOptionalBoolean,
  });
const createNoteApplyContentParams = createStandardNoteParams
  .extend({
    // This sets the default value for `apply` to `content`. The default fallback
    // only works when the `apply` is missing from the input; if it's there but
    // empty, the default won't be applied, and the route will return an error.
    apply: z.literal(CreateApplyParameterValue.Content)
      .optional()
      .default(CreateApplyParameterValue.Content),
    content: z.string().optional(),
  });
const createNoteApplyTemplaterParams = createStandardNoteParams
  .extend({
    apply: z.literal(CreateApplyParameterValue.Templater),
    "template-file": zodExistingTemplaterPath,
  });
const createNoteApplyTemplatesParams = createStandardNoteParams
  .extend({
    apply: z.literal(CreateApplyParameterValue.Templates),
    "template-file": zodExistingTemplatesPath,
  });
const createPeriodicNoteParams = incomingBaseParams
  .extend({
    "periodic-note": z.nativeEnum(PeriodicNoteType),
    "if-exists": z.nativeEnum(IfExistsParameterValue).optional(),
    silent: zodOptionalBoolean,
  });

export const createParams = z.union([
  createNoteApplyContentParams,
  createNoteApplyTemplaterParams,
  createNoteApplyTemplatesParams,
  createPeriodicNoteParams,
])
  .transform(resolveNoteTargeting);

export type CreateParams = z.infer<typeof createParams>;
export type CreateNoteApplyContentParams = z.infer<
  typeof createNoteApplyContentParams
>;
export type CreateNoteApplyTemplateParams = z.infer<
  | typeof createNoteApplyTemplatesParams
  | typeof createNoteApplyTemplaterParams
>;
export type CreatePeriodicNoteParams = z.infer<typeof createPeriodicNoteParams>;

// HELPERS ----------------------------------------

export async function createPeriodicNote(
  path: string,
  periodicNoteType: PeriodicNoteType,
  noteExists: boolean,
  ifExists: IfExistsParameterValue | undefined,
  shouldFocusNote: boolean,
): Promise<HandlerFileSuccess | HandlerFailure> {
  if (noteExists) {
    switch (ifExists) {
      // `skip` == Leave not as-is, we just return the existing note.
      case IfExistsParameterValue.Skip:
        if (shouldFocusNote) await focusOrOpenFile(path);
        return await getNoteDetails(path);

      // Overwrite the existing note.
      case IfExistsParameterValue.Overwrite:
        // Delete existing note, but keep going afterwards.
        await trashFilepath(path);
        break;

      default:
        return failure(
          ErrorCode.NoteAlreadyExists,
          STRINGS[`${periodicNoteType}_note`].create_note_already_exists,
        );
    }
  }

  const newNote = await createPeriodNote(periodicNoteType);
  if (!newNote) {
    return failure(
      ErrorCode.UnableToCreateNote,
      STRINGS.unable_to_write_note,
    );
  }

  if (shouldFocusNote) await focusOrOpenFile(path);
  return await getNoteDetails(path);
}

export async function createGeneralNote(
  this: RealLifePlugin,
  path: string,
  apply: CreateApplyParameterValue,
  content: string | undefined,
  templateFile: TFile | undefined,
  noteExists: boolean,
  shouldOverwrite: boolean,
  shouldFocusNote: boolean,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const resCreate = (noteExists && shouldOverwrite)
    ? await createOrOverwriteNote(path, "")
    : await createNote(path, "");
  if (!resCreate.isSuccess) return resCreate;
  const newNote = resCreate.result;

  // If the user wants to apply a template, we need to check if the relevant
  // plugin is available, and if not, we return from here.
  // Testing for existence of template file is done by a zod schema, so we can
  // be sure the file exists.
  switch (apply) {
    case CreateApplyParameterValue.Content:
      await this.app.vault.modify(newNote, content || "");
      break;

    case CreateApplyParameterValue.Templater:
      const resPlugin1 = getEnabledCommunityPlugin("templater-obsidian");
      if (!resPlugin1.isSuccess) return resPlugin1;
      await resPlugin1.result.templater
        .write_template_to_file(templateFile!, newNote);
      break;

    case CreateApplyParameterValue.Templates:
      const resPlugin2 = getEnabledCorePlugin("templates");
      if (!resPlugin2.isSuccess) return resPlugin2;
      await applyCorePluginTemplate(templateFile!, newNote);
      break;
  }

  if (shouldFocusNote) await focusOrOpenFile(newNote.path);
  return await getNoteDetails(newNote.path);
}
