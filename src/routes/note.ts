import { TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams, noteTargetingParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  appendNote,
  appendNoteBelowHeadline,
  applyCorePluginTemplate,
  createNote,
  createOrOverwriteNote,
  getNote,
  getNoteDetails,
  prependNote,
  prependNoteBelowHeadline,
  renameFilepath,
  sanitizeFilePath,
  searchAndReplaceInNote,
  touchNote,
  trashFilepath,
} from "../utils/file-handling";
import { obsEnv } from "../utils/obsidian-env";
import {
  hardValidateNoteTargetingAndResolvePath,
  softValidateNoteTargetingAndResolvePath,
} from "../utils/parameters";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "../utils/plugins";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";
import { parseStringIntoRegex } from "../utils/string-handling";
import { focusOrOpenFile } from "../utils/ui";
import {
  zodAlwaysFalse,
  zodEmptyStringChangedToDefaultString,
  zodExistingTemplaterPath,
  zodExistingTemplatesPath,
  zodOptionalBoolean,
  zodSanitizedNotePath,
  zodUndefinedChangedToDefaultValue,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const justReturnCallParams = incomingBaseParams
  .extend({
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  });
type JustReturnCallParams = z.infer<typeof justReturnCallParams>;

const getParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type GetParams = z.infer<typeof getParams>;

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
type ReadFirstNamedParams = z.infer<typeof readNamedParams>;

const openParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodAlwaysFalse,
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type OpenParams = z.infer<typeof openParams>;

const createBaseParams = incomingBaseParams
  .extend({
    file: zodSanitizedNotePath,
    "if-exists": z.enum(["overwrite", "skip", ""]).optional(),
    silent: zodOptionalBoolean,
  });
const createParams = z.discriminatedUnion("apply", [
  createBaseParams.extend({
    apply: z.literal("content"),
    content: z.string().optional(),
  }),
  createBaseParams.extend({
    apply: z.literal("templater"),
    "template-file": zodExistingTemplaterPath,
  }),
  createBaseParams.extend({
    apply: z.literal("templates"),
    "template-file": zodExistingTemplatesPath,
  }),
  createBaseParams.extend({
    apply: zodEmptyStringChangedToDefaultString("content"),
    content: z.string().optional(),
  }),
  createBaseParams.extend({
    apply: zodUndefinedChangedToDefaultValue("content"),
    content: z.string().optional(),
  }),
]);
type CreateParams = z.infer<typeof createParams>;
type createContentParams = {
  apply: "content";
  content?: string;
};
type createTemplateParams = {
  apply: "templater" | "templates";
  "template-file": TFile;
};

const appendParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    content: z.string(),
    silent: zodOptionalBoolean,
    "below-headline": z.string().optional(),
    "create-if-not-found": zodOptionalBoolean,
    "ensure-newline": zodOptionalBoolean,
  })
  .transform(softValidateNoteTargetingAndResolvePath);
type AppendParams = z.infer<typeof appendParams>;

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
  .transform(softValidateNoteTargetingAndResolvePath);
type PrependParams = z.infer<typeof prependParams>;

const touchParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type TouchParams = z.infer<typeof touchParams>;

const searchAndReplaceParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
    search: z.string().min(1, { message: "can't be empty" }),
    replace: z.string(),
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type SearchAndReplaceParams = z.infer<typeof searchAndReplaceParams>;

const deleteParams = incomingBaseParams
  .merge(noteTargetingParams)
  .transform(hardValidateNoteTargetingAndResolvePath);
type DeleteParams = z.infer<typeof deleteParams>;

const renameParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    "new-filename": zodSanitizedNotePath,
    silent: zodOptionalBoolean,
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type RenameParams = z.infer<typeof renameParams>;

export type AnyLocalParams =
  | JustReturnCallParams
  | GetParams
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
    { path: "/list", schema: justReturnCallParams, handler: handleList },
    { path: "/get", schema: getParams, handler: handleGet },
    {
      path: "/get-first-named",
      schema: readNamedParams,
      handler: handleGetNamed,
    },
    {
      path: "/get-active",
      schema: justReturnCallParams,
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
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: obsEnv.activeVault.getMarkdownFiles().map((t) => t.path).sort(),
  });
}

/**
 * Handler for `/note/get`. Existence of note is checked by the schema, i.e. the
 * handler won't be called if the file doesn't exist.
 */
async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _computed: { path }, silent } = incomingParams as GetParams;
  const res = await getNoteDetails(path);
  if (res.isSuccess && !silent) await focusOrOpenFile(path);
  return res;
}

async function handleGetActive(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res = obsEnv.activeWorkspace.getActiveFile();
  if (res?.extension !== "md") return failure(404, "No active note");

  const res1 = await getNoteDetails(res.path);
  return (res1.isSuccess) ? res1 : failure(404, "No active note");
}

async function handleGetNamed(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = incomingParams as ReadFirstNamedParams;
  const { file } = params;
  const sortBy = params["sort-by"] || "best-guess";

  // "Best guess" means utilizing Obsidian's internal link resolution to find
  // the right note. If it's not found, we return a 404.
  if (sortBy === "best-guess") {
    const res = obsEnv.metadataCache
      .getFirstLinkpathDest(sanitizeFilePath(file), "/");
    return res
      ? await getNoteDetails(res.path)
      : failure(404, "No note found with that name");
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

  const res = obsEnv.activeVault.getMarkdownFiles()
    .sort(sortFns[sortBy])
    .find((tf) => tf.name === file);
  if (!res) return failure(404, "No note found with that name");

  return await getNoteDetails(res.path);
}

/**
 * Handler for `/note/open`. Existence of note is checked by the schema, i.e. the
 * handler won't be called if the file doesn't exist.
 */
async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _computed: { path } } = incomingParams as OpenParams;
  const res = await getNote(path);
  return res.isSuccess
    ? success({ message: STRINGS.note_opened }, res.result.path)
    : res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = incomingParams as CreateParams;
  const { apply, file, silent } = params;
  const ifExists = params["if-exists"];
  const templateFile = (apply === "templater" || apply === "templates")
    ? (<createTemplateParams> params)["template-file"]
    : undefined;
  const content = (apply === "content")
    ? (<createContentParams> params).content || ""
    : "";
  var pluginInstance;

  // If the user wants to apply a template, we need to check if the relevant
  // plugin is available, and if not, we return from here.
  if (apply === "templater") {
    const pluginRes = getEnabledCommunityPlugin("templater-obsidian");
    if (!pluginRes.isSuccess) return pluginRes;
    pluginInstance = pluginRes.result.templater;
  } else if (apply === "templates") {
    const pluginRes = getEnabledCorePlugin("templates");
    if (!pluginRes.isSuccess) return pluginRes;
    pluginInstance = pluginRes.result;
  }

  // If there already is a note with that name or at that path, deal with it.
  const res = await getNote(file);
  const noteExists = res.isSuccess;
  if (noteExists && ifExists === "skip") {
    // `skip` == Leave not as-is, we just return the existing note.
    if (!silent) await focusOrOpenFile(file);
    return await getNoteDetails(file);
  }

  const res2 = (noteExists && ifExists === "overwrite")
    ? await createOrOverwriteNote(file, content)
    : await createNote(file, content);
  if (!res2.isSuccess) return res2;
  const newNote = res2.result;

  // If we're applying a template, we need to write it to the file. Testing for
  // existence of template file is done by a zod schema, so we can be sure the
  // file exists.
  switch (apply) {
    case "templater":
      await pluginInstance.write_template_to_file(templateFile, newNote);
      break;

    case "templates":
      await applyCorePluginTemplate(templateFile!, newNote);
      break;
  }

  if (!silent) await focusOrOpenFile(newNote.path);
  return await getNoteDetails(newNote.path);
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = incomingParams as AppendParams;
  const {
    _computed: { inputKey, pathExists, path: computedPath },
    content,
    silent,
    uid,
  } = params;
  const belowHeadline = params["below-headline"];
  const shouldCreateNote = params["create-if-not-found"];
  const shouldEnsureNewline = params["ensure-newline"];

  // If the note was requested via UID, doesn't exist but should be created,
  // we'll use the UID as path. Otherwise, we'll use the resolved path as it was
  // passed in.
  const path = (!pathExists && inputKey === "uid" && shouldCreateNote)
    ? uid!
    : computedPath;

  async function appendAsRequested() {
    if (belowHeadline) {
      return await appendNoteBelowHeadline(path, belowHeadline, content);
    }

    return await appendNote(path, content, shouldEnsureNewline);
  }

  // If the file doesn't exist …
  if (!pathExists) {
    // … check if we're supposed to create it. If not, back off.
    if (!shouldCreateNote) return failure(404, STRINGS.note_not_found);

    // We're supposed to create the note. We try to create it.
    const resCreate = await createNote(path, "");
    if (!resCreate.isSuccess) return resCreate;

    // If the note was requested via UID, we need to set the UID in the front
    // matter of the newly created note.
    if (inputKey === "uid") {
      await obsEnv.app.fileManager.processFrontMatter(
        resCreate.result,
        (fm) => fm[obsEnv.plugin.settings.frontmatterKey] = uid!,
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
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = incomingParams as PrependParams;
  const {
    _computed: { inputKey, pathExists, path: computedPath },
    content,
    silent,
    uid,
  } = params;
  const belowHeadline = params["below-headline"];
  const shouldCreateNote = params["create-if-not-found"];
  const shouldEnsureNewline = params["ensure-newline"];
  const shouldIgnoreFrontMatter = params["ignore-front-matter"];

  // If the note was requested via UID, doesn't exist but should be created,
  // we'll use the UID as path. Otherwise, we'll use the resolved path as it was
  // passed in.
  const path = (!pathExists && inputKey === "uid" && shouldCreateNote)
    ? uid!
    : computedPath;

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
  if (!pathExists) {
    // … check if we're supposed to create it. If not, back off.
    if (!shouldCreateNote) return failure(404, STRINGS.note_not_found);

    // We're supposed to create the note. We try to create it.
    const resCreate = await createNote(path, "");
    if (!resCreate.isSuccess) return resCreate;

    // If the note was requested via UID, we need to set the UID in the front
    // matter of the newly created note.
    if (inputKey === "uid") {
      await obsEnv.app.fileManager.processFrontMatter(
        resCreate.result,
        (fm) => fm[obsEnv.plugin.settings.frontmatterKey] = uid!,
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
  const { _computed: { path }, silent } = incomingParams as TouchParams;

  const res = await touchNote(path);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(path);
  return success({ message: STRINGS.touch_done }, path);
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _computed: { path }, search, replace, silent } =
    incomingParams as SearchAndReplaceParams;

  const res = await searchAndReplaceInNote(path, search, replace);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(path);
  return success({ message: res.result }, path);
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _computed: { path }, search, replace, silent } =
    incomingParams as SearchAndReplaceParams;

  const resSir = parseStringIntoRegex(search);
  if (!resSir.isSuccess) return resSir;

  const res = await searchAndReplaceInNote(path, resSir.result, replace);
  if (!res.isSuccess) return res;
  if (!silent) await focusOrOpenFile(path);
  return success({ message: res.result }, path);
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _computed: { path } } = incomingParams as DeleteParams;

  const res = await trashFilepath(path, true);
  return res.isSuccess ? success({ message: res.result }, path) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { _computed: { path } } = incomingParams as DeleteParams;

  const res = await trashFilepath(path);
  return res.isSuccess ? success({ message: res.result }, path) : res;
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = incomingParams as RenameParams;
  const { _computed: { path } } = params;
  const newPath = params["new-filename"];

  const res = await renameFilepath(path, newPath);
  return res.isSuccess ? success({ message: res.result }, path) : res;
}
