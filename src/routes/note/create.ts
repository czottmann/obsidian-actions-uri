import { TAbstractFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  Prettify,
  RealLifePlugin,
  TFileResultObject,
} from "src/types";
import {
  applyCorePluginTemplate,
  createNote,
  createOrOverwriteNote,
  getNote,
  getNoteDetails,
  sanitizeFilePath,
  trashFilepath,
} from "src/utils/file-handling";
import {
  createPeriodicNote,
  PeriodicNoteType,
} from "src/utils/periodic-notes-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "src/utils/plugins";
import {
  mergeResolvedData,
  ResolvedNoteTargetingValues,
  resolveNoteTargeting,
} from "src/utils/parameters";
import { ErrorCode, failure } from "src/utils/results-handling";
import { self } from "src/utils/self";
import { focusOrOpenFile } from "src/utils/ui";
import { zodOptionalBoolean } from "src/utils/zod";

// TYPES ----------------------------------------

export enum CreateApplyParameterValue {
  Content = "content",
  Templater = "templater",
  Templates = "templates",
}

enum IfExistsParameterValue {
  Default = "",
  Overwrite = "overwrite",
  Skip = "skip",
}

// SCHEMAS ----------------------------------------

const optionalIfExists = z.nativeEnum(IfExistsParameterValue).optional();

const createNoteApplyContentParams = incomingBaseParams
  .extend({
    file: z.string(),
    // This sets the default value for `apply` to `content`. The default fallback
    // only works when the `apply` is missing from the input; if it's there but
    // empty, the default won't be applied, and the route will return an error.
    apply: z.literal(CreateApplyParameterValue.Content)
      .optional()
      .default(CreateApplyParameterValue.Content),
    content: z.string().optional(),
    "if-exists": optionalIfExists,
    silent: zodOptionalBoolean,
  });

const createNoteApplyTemplateParams = incomingBaseParams
  .extend({
    file: z.string(),
    apply: z.enum([
      CreateApplyParameterValue.Templater,
      CreateApplyParameterValue.Templates,
    ]),
    "template-file": z.string(),
    "if-exists": optionalIfExists,
    silent: zodOptionalBoolean,
  })
  .transform(resolveTemplatePathStrict);

const createPeriodicNoteParams = incomingBaseParams
  .extend({
    "periodic-note": z.nativeEnum(PeriodicNoteType),
    "if-exists": optionalIfExists,
    silent: zodOptionalBoolean,
  });

export const createParams = z.union([
  createNoteApplyContentParams,
  createNoteApplyTemplateParams,
  createPeriodicNoteParams,
])
  .transform(resolveNoteTargeting);

// TYPES ----------------------------------------

export type CreateParams = Prettify<z.infer<typeof createParams>>;

export type CreateNoteApplyContentParams = Prettify<
  & z.infer<typeof createNoteApplyContentParams>
  & ResolvedNoteTargetingValues
>;
export type CreateNoteApplyTemplateParams = Prettify<
  & z.infer<typeof createNoteApplyTemplateParams>
  & ResolvedNoteTargetingValues
  & ResolvedTemplatePathValues
>;
export type AnyCreateNoteApplyParams =
  | CreateNoteApplyContentParams
  | CreateNoteApplyTemplateParams;

export type CreatePeriodicNoteParams = Prettify<
  & z.infer<typeof createPeriodicNoteParams>
  & ResolvedNoteTargetingValues
>;

// HANDLERS ----------------------------------------

export async function _handleCreatePeriodicNote(
  this: RealLifePlugin,
  params: CreatePeriodicNoteParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const {
    _resolved: { inputPath },
    ["if-exists"]: ifExists,
    ["periodic-note"]: periodicNoteType,
    silent,
  } = params;
  const shouldFocusNote = !silent;

  // If there already is a note with that name or at that path, deal with it.
  const resNoteExists = await getNote(inputPath);
  if (resNoteExists.isSuccess) {
    switch (ifExists) {
      // `skip` == Leave not as-is, we just return the existing note.
      case IfExistsParameterValue.Skip:
        if (shouldFocusNote) await focusOrOpenFile(inputPath);
        return await getNoteDetails(inputPath);

      // Overwrite the existing note.
      case IfExistsParameterValue.Overwrite:
        // Delete existing note, but keep going afterwards.
        await trashFilepath(inputPath);
        break;

      default:
        return failure(
          ErrorCode.NoteAlreadyExists,
          STRINGS[`${periodicNoteType}_note`].create_note_already_exists,
        );
    }
  }

  const newNote = await createPeriodicNote(periodicNoteType);
  if (!newNote) {
    return failure(
      ErrorCode.UnableToCreateNote,
      STRINGS.unable_to_write_note,
    );
  }

  if (shouldFocusNote) await focusOrOpenFile(inputPath);
  return await getNoteDetails(inputPath);
}

export async function _handleCreateNoteFromContent(
  this: RealLifePlugin,
  params: CreateNoteApplyContentParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const {
    _resolved: { inputPath },
    ["if-exists"]: ifExists,
    content,
    silent,
  } = params;
  const shouldFocusNote = !silent;

  // If there already is a note with that name or at that path, deal with it.
  let resCreate: TFileResultObject | undefined;
  const resNoteExists = await getNote(inputPath);
  if (resNoteExists.isSuccess) {
    switch (ifExists) {
      // `skip` == Leave not as-is, we just return the existing note.
      case IfExistsParameterValue.Skip:
        if (shouldFocusNote) await focusOrOpenFile(inputPath);
        return await getNoteDetails(inputPath);

      case IfExistsParameterValue.Overwrite:
        resCreate = await createOrOverwriteNote(inputPath, "");
        break;

        // Overwrite with suffix
      default:
        resCreate = await createNote(inputPath, "");
        break;
    }
  } //
  // The note doesn't exist yet, so we create it.
  else {
    resCreate = await createNote(inputPath, "");
  }

  if (!resCreate?.isSuccess) return resCreate!;
  const newNote = resCreate.result;

  await this.app.vault.modify(newNote, content || "");

  if (shouldFocusNote) await focusOrOpenFile(newNote.path);
  return await getNoteDetails(newNote.path);
}

export async function _handleCreateNoteFromTemplate(
  this: RealLifePlugin,
  params: CreateNoteApplyTemplateParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const {
    _resolved: { inputPath, templateFile },
    ["if-exists"]: ifExists,
    apply,
    silent,
  } = params;
  const shouldFocusNote = !silent;

  // If there already is a note with that name or at that path, deal with it.
  let resCreate: TFileResultObject | undefined;
  const resNoteExists = await getNote(inputPath);
  if (resNoteExists.isSuccess) {
    switch (ifExists) {
      // `skip` == Leave not as-is, we just return the existing note.
      case IfExistsParameterValue.Skip:
        if (shouldFocusNote) await focusOrOpenFile(inputPath);
        return await getNoteDetails(inputPath);

      case IfExistsParameterValue.Overwrite:
        resCreate = await createOrOverwriteNote(inputPath, "");
        break;

        // Overwrite with suffix
      default:
        resCreate = await createNote(inputPath, "");
        break;
    }
  } //
  // The note doesn't exist yet, so we create it.
  else {
    resCreate = await createNote(inputPath, "");
  }

  if (!resCreate?.isSuccess) return resCreate!;
  const newNote = resCreate.result;

  // We need to check if the relevant plugin is available, and if not, we return
  // from here. Testing for existence of template file is done by a zod transform,
  // so we can be sure the file exists.
  switch (apply) {
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

// RESOLVERS ----------------------------------------

type ResolvedTemplatePathValues = Readonly<{
  _resolved: {
    templatePath: string;
    templateFile: TAbstractFile | undefined;
  };
}>;

/**
 * Validates the `template-file` parameter of a note and adds computed values to
 * the input object (under the `_resolved` key).
 *
 * This function resolves the input parameter into a `TAbstractFile` instance.
 * The file is looked up in the templates folder specified in the Templates or
 * Templater settings, depending on the `apply` parameter. If the file is not
 * found, a Zod validation error is triggered.
 *
 * @param data - The input data containing the `template-file` key.
 * @param ctx - The Zod refinement context used for adding validation issues.
 * @returns The input object augmented with computed values if validation
 * succeeds; otherwise, it triggers a Zod validation error.
 * @throws {ZodError} When more than one or none of the targeting parameters are provided.
 *
 * @template T - The type of the input data.
 */
export function resolveTemplatePathStrict<T>(
  data: T,
  ctx: z.RefinementCtx,
): T & ResolvedTemplatePathValues {
  const { "template-file": input, apply } =
    data as unknown as CreateNoteApplyTemplateParams;
  let folder = "";

  switch (apply) {
    case CreateApplyParameterValue.Templater:
      const resTemplater = getEnabledCommunityPlugin("templater-obsidian");
      if (!resTemplater.isSuccess) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: STRINGS.templater.feature_not_available,
        });
        return z.NEVER;
      }
      folder = resTemplater.result.settings?.templates_folder || "";
      break;

    case CreateApplyParameterValue.Templates:
      const resTemplates = getEnabledCorePlugin("templates");
      if (!resTemplates.isSuccess) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: STRINGS.templates.feature_not_available,
        });
        return z.NEVER;
      }
      folder = resTemplates.result.options?.folder || "";
      break;

    default:
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: STRINGS.faulty_apply_parameter,
      });
      return z.NEVER;
  }

  // Check if the file exists in the specified folder. We try two paths: the
  // input prefixed with the template folder as configured in the relevant plugin,
  // and the input as is (in case the input already is a full path).
  const { vault } = self().app;
  const templateFile =
    vault.getFileByPath(sanitizeFilePath(`${folder}/${input}`)) ||
    vault.getFileByPath(sanitizeFilePath(input));
  if (!templateFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: STRINGS.template_not_found,
    });
    return z.NEVER;
  }

  return mergeResolvedData(data, {
    templatePath: templateFile.path,
    templateFile,
  });
}
