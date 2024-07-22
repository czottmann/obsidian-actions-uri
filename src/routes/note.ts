import { TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { AnyParams, NoteTargetingParameterKey, RoutePath } from "src/routes";
import {
  _handleCreateNoteFromContent,
  _handleCreateNoteFromTemplate,
  _handleCreatePeriodicNote,
  AnyCreateNoteApplyParams,
  CreateApplyParameterValue,
  CreateNoteApplyContentParams,
  CreateNoteApplyTemplateParams,
  CreateParams,
  createParams,
  CreatePeriodicNoteParams,
} from "src/routes/note/create";
import {
  incomingBaseParams,
  noteTargetingParams,
  noteTargetingWithRecentsParams,
} from "src/schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
  Prettify,
  RealLifePlugin,
} from "src/types";
import {
  appendNote,
  appendNoteBelowHeadline,
  createNote,
  getNote,
  getNoteDetails,
  prependNote,
  prependNoteBelowHeadline,
  renameFilepath,
  sanitizeFilePath,
  searchAndReplaceInNote,
  touchNote,
  trashFilepath,
} from "src/utils/file-handling";
import {
  resolveNoteTargeting,
  resolveNoteTargetingStrict,
} from "src/utils/parameters";
import {
  checkForEnabledPeriodicNoteFeature,
  getAllPeriodicNotes,
  PeriodicNoteType,
} from "src/utils/periodic-notes-handling";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";
import { parseStringIntoRegex } from "src/utils/string-handling";
import { focusOrOpenFile } from "src/utils/ui";
import { zodOptionalBoolean, zodSanitizedNotePath } from "src/utils/zod";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams
  .extend({
    "periodic-note": z.nativeEnum(PeriodicNoteType).optional(),
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  });

const getParams = incomingBaseParams
  .merge(noteTargetingWithRecentsParams)
  .extend({
    silent: zodOptionalBoolean,
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  })
  .transform(resolveNoteTargetingStrict);

const getActiveParams = incomingBaseParams
  .extend({
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  });

const readNamedParams = incomingBaseParams
  .extend({
    file: zodSanitizedNotePath,
    "sort-by": z.enum([
      "best-guess",
      "path-asc",
      "path-desc",
      "ctime-asc",
      "ctime-desc",
      "mtime-asc",
      "mtime-desc",
      "",
    ]).optional(),
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  });

const openParams = incomingBaseParams
  .merge(noteTargetingWithRecentsParams)
  .transform(resolveNoteTargetingStrict);

const appendParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    content: z.string(),
    silent: zodOptionalBoolean,
    "below-headline": z.string().optional(),
    "create-if-not-found": zodOptionalBoolean,
    "ensure-newline": zodOptionalBoolean,
  })
  .transform(resolveNoteTargeting);

const prependParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    content: z.string(),
    silent: zodOptionalBoolean,
    "below-headline": z.string().optional(),
    "create-if-not-found": zodOptionalBoolean,
    "ensure-newline": zodOptionalBoolean,
    "ignore-front-matter": zodOptionalBoolean,
  })
  .transform(resolveNoteTargeting);

const touchParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
  })
  .transform(resolveNoteTargetingStrict);

const searchAndReplaceParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
    search: z.string().min(1, { message: "can't be empty" }),
    replace: z.string(),
  })
  .transform(resolveNoteTargetingStrict);

const deleteParams = incomingBaseParams
  .merge(noteTargetingParams)
  .transform(resolveNoteTargetingStrict);

const renameParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    "new-filename": zodSanitizedNotePath,
    silent: zodOptionalBoolean,
  })
  .transform(resolveNoteTargetingStrict);

// TYPES ----------------------------------------

type ListParams = Prettify<z.infer<typeof listParams>>;
type GetParams = Prettify<z.infer<typeof getParams>>;
type GetActiveParams = Prettify<z.infer<typeof getActiveParams>>;
type ReadFirstNamedParams = Prettify<z.infer<typeof readNamedParams>>;
type OpenParams = Prettify<z.infer<typeof openParams>>;
type AppendParams = Prettify<z.infer<typeof appendParams>>;
type PrependParams = Prettify<z.infer<typeof prependParams>>;
type TouchParams = Prettify<z.infer<typeof touchParams>>;
type SearchAndReplaceParams = Prettify<z.infer<typeof searchAndReplaceParams>>;
type DeleteParams = Prettify<z.infer<typeof deleteParams>>;
type RenameParams = Prettify<z.infer<typeof renameParams>>;

export type AnyLocalParams =
  | ListParams
  | GetParams
  | GetActiveParams
  | ReadFirstNamedParams
  | OpenParams
  | CreateParams
  | AppendParams
  | PrependParams
  | TouchParams
  | SearchAndReplaceParams
  | DeleteParams
  | RenameParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/note": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    { path: "/get", schema: getParams, handler: handleGet },
    {
      path: "/get-first-named",
      schema: readNamedParams,
      handler: handleGetNamed,
    },
    {
      path: "/get-active",
      schema: getActiveParams,
      handler: handleGetActive,
    },
    { path: "/open", schema: openParams, handler: handleOpen },
    { path: "/create", schema: createParams, handler: handleCreate },
    { path: "/append", schema: appendParams, handler: handleAppend },
    { path: "/prepend", schema: prependParams, handler: handlePrepend },
    { path: "/touch", schema: touchParams, handler: handleTouch },
    { path: "/delete", schema: deleteParams, handler: handleDelete },
    { path: "/trash", schema: deleteParams, handler: handleTrash },
    { path: "/rename", schema: renameParams, handler: handleRename },
    {
      path: "/search-string-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchStringAndReplace,
    },
    {
      path: "/search-regex-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchRegexAndReplace,
    },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  const { "periodic-note": periodicNoteType } = incomingParams as ListParams;
  // If no periodic note type is specified, we return all notes.
  if (!periodicNoteType) {
    return success({
      paths: this.app.vault.getMarkdownFiles().map((t) => t.path).sort(),
    });
  }

  // If a periodic note type is specified, we return all notes of that type.
  if (!checkForEnabledPeriodicNoteFeature(periodicNoteType)) {
    return failure(
      ErrorCode.FeatureUnavailable,
      STRINGS[`${periodicNoteType}_note`].feature_not_available,
    );
  }

  const notes = getAllPeriodicNotes(periodicNoteType);
  return success({
    paths: Object.keys(notes).sort().reverse().map((k) => notes[k].path),
  });
}

/**
 * Handler for `/note/get`. Existence of note is checked by the schema, i.e. the
 * handler won't be called if the file doesn't exist.
 */
async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _resolved: { inputPath }, silent } = incomingParams as GetParams;
  const res = await getNoteDetails(inputPath);
  if (res.isSuccess && !silent) await focusOrOpenFile(inputPath);
  return res;
}

async function handleGetActive(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res = this.app.workspace.getActiveFile();
  if (res?.extension !== "md") {
    return failure(ErrorCode.NotFound, "No active note");
  }

  const res1 = await getNoteDetails(res.path);
  return (res1.isSuccess)
    ? res1
    : failure(ErrorCode.NotFound, "No active note");
}

async function handleGetNamed(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = incomingParams as ReadFirstNamedParams;
  const { file } = params;
  const sortBy = params["sort-by"] || "best-guess";

  // "Best guess" means utilizing Obsidian's internal link resolution to find
  // the right note. If it's not found, we return a 404.
  if (sortBy === "best-guess") {
    const res = this.app.metadataCache
      .getFirstLinkpathDest(sanitizeFilePath(file), "/");
    return res
      ? await getNoteDetails(res.path)
      : failure(ErrorCode.NotFound, "No note found with that name");
  }

  // If we're here, we're sorting by something else. We need to find all notes
  // with that name, sort them as requested, and return the first one.
  const sortFns = {
    "path-asc": (a: TFile, b: TFile) => a.path.localeCompare(b.path),
    "path-desc": (a: TFile, b: TFile) => b.path.localeCompare(a.path),
    "ctime-asc": (a: TFile, b: TFile) => a.stat.ctime - b.stat.ctime,
    "ctime-desc": (a: TFile, b: TFile) => b.stat.ctime - a.stat.ctime,
    "mtime-asc": (a: TFile, b: TFile) => a.stat.mtime - b.stat.mtime,
    "mtime-desc": (a: TFile, b: TFile) => b.stat.mtime - a.stat.mtime,
  };

  const res = this.app.vault.getMarkdownFiles()
    .sort(sortFns[sortBy])
    .find((tf) => tf.name === file);
  if (!res) return failure(ErrorCode.NotFound, "No note found with that name");

  return await getNoteDetails(res.path);
}

/**
 * Handler for `/note/open`. Existence of note is checked by the schema, i.e. the
 * handler won't be called if the file doesn't exist.
 */
async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath } } = incomingParams as OpenParams;
  const res = await getNote(inputPath);
  return res.isSuccess
    ? success({ message: STRINGS.note_opened }, res.result.path)
    : res;
}

async function handleCreate(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _resolved: { inputKey } } = incomingParams as CreateParams;

  if (inputKey === NoteTargetingParameterKey.PeriodicNote) {
    return _handleCreatePeriodicNote
      .bind(this)(incomingParams as CreatePeriodicNoteParams);
  }

  const applyValue = (incomingParams as AnyCreateNoteApplyParams).apply;
  switch (applyValue) {
    case CreateApplyParameterValue.Content:
      return _handleCreateNoteFromContent
        .bind(this)(incomingParams as CreateNoteApplyContentParams);

    case CreateApplyParameterValue.Templater:
    case CreateApplyParameterValue.Templates:
      return _handleCreateNoteFromTemplate
        .bind(this)(incomingParams as CreateNoteApplyTemplateParams);
  }
}

async function handleAppend(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const {
    _resolved: { inputKey, inputFile, inputPath },
    ["below-headline"]: belowHeadline,
    ["create-if-not-found"]: shouldCreateNote,
    ["ensure-newline"]: shouldEnsureNewline,
    content,
    silent,
    uid,
  } = incomingParams as AppendParams;

  // If the note was requested via UID, doesn't exist but should be created,
  // we'll use the UID as path. Otherwise, we'll use the resolved path as it was
  // passed in.
  const path = (
      !inputFile &&
      inputKey === NoteTargetingParameterKey.UID &&
      shouldCreateNote
    )
    ? uid!
    : inputPath;

  async function appendAsRequested() {
    if (belowHeadline) {
      return await appendNoteBelowHeadline(path, belowHeadline, content);
    }

    return await appendNote(path, content, shouldEnsureNewline);
  }

  // If the file doesn't exist …
  if (!inputFile) {
    // … check if we're supposed to create it. If not, back off.
    if (!shouldCreateNote) {
      return failure(ErrorCode.NotFound, STRINGS.note_not_found);
    }

    // We're supposed to create the note. We try to create it.
    const resCreate = await createNote(path, "");
    if (!resCreate.isSuccess) return resCreate;

    // If the note was requested via UID, we need to set the UID in the front
    // matter of the newly created note.
    if (inputKey === NoteTargetingParameterKey.UID) {
      await this.app.fileManager.processFrontMatter(
        resCreate.result,
        (fm) => fm[this.settings.frontmatterKey] = uid!,
      );
    }
  }

  // Manipulate the file.
  const resAppend = await appendAsRequested();
  if (resAppend.isSuccess) {
    if (!silent) await focusOrOpenFile(path);
    return success({ message: resAppend.result }, path);
  }
  return resAppend;
}

async function handlePrepend(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const {
    _resolved: { inputKey, inputFile, inputPath },
    ["below-headline"]: belowHeadline,
    ["create-if-not-found"]: shouldCreateNote,
    ["ensure-newline"]: shouldEnsureNewline,
    ["ignore-front-matter"]: shouldIgnoreFrontMatter,
    content,
    silent,
    uid,
  } = incomingParams as PrependParams;

  // If the note was requested via UID, doesn't exist but should be created,
  // we'll use the UID as path. Otherwise, we'll use the resolved path as it was
  // passed in.
  const path = (
      !inputFile &&
      inputKey === NoteTargetingParameterKey.UID &&
      shouldCreateNote
    )
    ? uid!
    : inputPath;

  async function prependAsRequested() {
    if (belowHeadline) {
      return await prependNoteBelowHeadline(
        path,
        belowHeadline,
        content,
        shouldEnsureNewline,
      );
    }

    return await prependNote(
      path,
      content,
      shouldEnsureNewline,
      shouldIgnoreFrontMatter,
    );
  }

  // If the file doesn't exist …
  if (!inputFile) {
    // … check if we're supposed to create it. If not, back off.
    if (!shouldCreateNote) {
      return failure(ErrorCode.NotFound, STRINGS.note_not_found);
    }

    // We're supposed to create the note. We try to create it.
    const resCreate = await createNote(path, "");
    if (!resCreate.isSuccess) return resCreate;

    // If the note was requested via UID, we need to set the UID in the front
    // matter of the newly created note.
    if (inputKey === NoteTargetingParameterKey.UID) {
      await this.app.fileManager.processFrontMatter(
        resCreate.result,
        (fm) => fm[this.settings.frontmatterKey] = uid!,
      );
    }
  }

  // Manipulate the file.
  const resPrepend = await prependAsRequested();
  if (resPrepend.isSuccess) {
    if (!silent) await focusOrOpenFile(path);
    return success({ message: resPrepend.result }, path);
  }
  return resPrepend;
}

async function handleTouch(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath }, silent } = incomingParams as TouchParams;

  const res = await touchNote(inputPath);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(inputPath);
  return success({ message: STRINGS.touch_done }, inputPath);
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath }, search, replace, silent } =
    incomingParams as SearchAndReplaceParams;

  const res = await searchAndReplaceInNote(inputPath, search, replace);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(inputPath);
  return success({ message: res.result }, inputPath);
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath }, search, replace, silent } =
    incomingParams as SearchAndReplaceParams;

  const resSir = parseStringIntoRegex(search);
  if (!resSir.isSuccess) return resSir;

  const res = await searchAndReplaceInNote(inputPath, resSir.result, replace);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(inputPath);
  return success({ message: res.result }, inputPath);
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath } } = incomingParams as DeleteParams;

  const res = await trashFilepath(inputPath, true);
  return res.isSuccess ? success({ message: res.result }, inputPath) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath } } = incomingParams as DeleteParams;

  const res = await trashFilepath(inputPath);
  return res.isSuccess ? success({ message: res.result }, inputPath) : res;
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _resolved: { inputPath }, ["new-filename"]: newPath } =
    incomingParams as RenameParams;

  const res = await renameFilepath(inputPath, newPath);
  return res.isSuccess ? success({ message: res.result }, inputPath) : res;
}
