import { TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../../constants";
import { CreateApplyParameterValue } from "../../routes";
import { incomingBaseParams } from "../../schemata";
import { HandlerFailure, HandlerFileSuccess } from "../../types";
import {
  applyCorePluginTemplate,
  createNote,
  createOrOverwriteNote,
  getNoteDetails,
  trashFilepath,
} from "../../utils/file-handling";
import {
  createPeriodNote,
  PeriodicNoteType,
} from "../../utils/periodic-notes-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "../../utils/plugins";
import {
  softValidateNoteTargetingAndResolvePath,
} from "../../utils/parameters";
import { ErrorCode, failure } from "../../utils/results-handling";
import { self } from "../../utils/self";
import { focusOrOpenFile } from "../../utils/ui";
import {
  zodExistingTemplaterPath,
  zodExistingTemplatesPath,
  zodOptionalBoolean,
  zodSanitizedNotePath,
} from "../../utils/zod";

const createStandardNoteParams = incomingBaseParams
  .extend({
    file: zodSanitizedNotePath,
    "if-exists": z.enum(["overwrite", "skip", ""]).optional(),
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
    "if-exists": z.enum(["overwrite", "skip", ""]).optional(),
    silent: zodOptionalBoolean,
  });

export const createParams = z.union([
  createNoteApplyContentParams,
  createNoteApplyTemplaterParams,
  createNoteApplyTemplatesParams,
  createPeriodicNoteParams,
])
  .transform(softValidateNoteTargetingAndResolvePath);

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
  shouldOverwrite: boolean,
  shouldFocusNote: boolean,
): Promise<HandlerFileSuccess | HandlerFailure> {
  if (noteExists) {
    if (shouldOverwrite) {
      await trashFilepath(path);
    } else {
      if (shouldFocusNote) await focusOrOpenFile(path);
      return await getNoteDetails(path);
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
      await self().app.vault.modify(newNote, content || "");
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
