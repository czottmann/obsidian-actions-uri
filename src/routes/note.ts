import { TFile } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  activeVault,
  activeWorkspace,
  appendNote,
  appendNoteBelowHeadline,
  applyCorePluginTemplate,
  createNote,
  createOrOverwriteNote,
  getNoteDetails,
  getNoteFile,
  prependNote,
  prependNoteBelowHeadline,
  renameFilepath,
  searchAndReplaceInNote,
  touchNote,
  trashFilepath,
} from "../utils/file-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "../utils/plugins";
import { helloRoute } from "../utils/routing";
import { failure, success } from "../utils/results-handling";
import { parseStringIntoRegex } from "../utils/string-handling";
import { focusOrOpenNote } from "../utils/ui";
import {
  zodAlwaysFalse,
  zodEmptyStringChangedToDefaultString,
  zodExistingFilePath,
  zodOptionalBoolean,
  zodSanitizedFilePath,
  zodUndefinedChangedToDefaultValue,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

const readParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

const readActiveParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadActiveParams = z.infer<typeof readActiveParams>;

const readNamedParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  "sort-by": z.enum([
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

const openParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  silent: zodAlwaysFalse,
});
type OpenParams = z.infer<typeof openParams>;

const createBaseParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
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
    "template-file": zodExistingFilePath,
  }),
  createBaseParams.extend({
    apply: z.literal("templates"),
    "template-file": zodExistingFilePath,
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

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "below-headline": z.string().optional(),
  "create-if-not-found": zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});
type PrependParams = z.infer<typeof prependParams>;

const touchParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});
type TouchParams = z.infer<typeof touchParams>;

const searchAndReplaceParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});
type SearchAndReplaceParams = z.infer<typeof searchAndReplaceParams>;

const deleteParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
});
type DeleteParams = z.infer<typeof deleteParams>;

const renameParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  "new-filename": zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});
type RenameParams = z.infer<typeof renameParams>;

export type AnyLocalParams =
  | ListParams
  | ReadParams
  | ReadFirstNamedParams
  | ReadActiveParams
  | OpenParams
  | CreateParams
  | AppendParams
  | PrependParams
  | TouchParams
  | SearchAndReplaceParams
  | DeleteParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/note": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    { path: "/get", schema: readParams, handler: handleGet },
    {
      path: "/get-first-named",
      schema: readNamedParams,
      handler: handleGetNamed,
    },
    { path: "/get-active", schema: readActiveParams, handler: handleGetActive },
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
    paths: activeVault().getMarkdownFiles().map((t) => t.path).sort(),
  });
}

async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { file, silent } = <ReadParams> incomingParams;
  const shouldFocusNote = !silent;

  const res = await getNoteDetails(file);
  if (res.isSuccess && shouldFocusNote) await focusOrOpenNote(file);
  return res;
}

async function handleGetActive(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const res = activeWorkspace().getActiveFile();
  if (res?.extension !== "md") return failure(404, "No active note");

  const res1 = await getNoteDetails(res.path);
  return (res1.isSuccess) ? res1 : failure(404, "No active note");
}

async function handleGetNamed(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <ReadFirstNamedParams> incomingParams;
  const { file } = params;
  const sortBy = params["sort-by"] || "path-asc";

  const sortFns = {
    "path-asc": (a: TFile, b: TFile) => a.path.localeCompare(b.path),
    "path-desc": (a: TFile, b: TFile) => b.path.localeCompare(a.path),
    "ctime-asc": (a: TFile, b: TFile) => a.stat.ctime - b.stat.ctime,
    "ctime-desc": (a: TFile, b: TFile) => b.stat.ctime - a.stat.ctime,
    "mtime-asc": (a: TFile, b: TFile) => a.stat.mtime - b.stat.mtime,
    "mtime-desc": (a: TFile, b: TFile) => b.stat.mtime - a.stat.mtime,
  };

  const res = activeVault().getMarkdownFiles()
    .sort(sortFns[sortBy])
    .find((tf) => tf.name === file);
  if (!res) return failure(404, "No note found with that name");

  return await getNoteDetails(res.path);
}
async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <OpenParams> incomingParams;

  const res = await getNoteFile(file.path);
  return res.isSuccess
    ? success({ message: STRINGS.note_opened }, res.result.path)
    : res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const { apply, file, silent } = params;
  const ifExists = params["if-exists"];
  const shouldFocusNote = !silent;
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
  const res = await getNoteFile(file);
  const noteExists = res.isSuccess;
  if (noteExists && ifExists === "skip") {
    // `skip` == Leave not as-is, we just return the existing note.
    if (shouldFocusNote) await focusOrOpenNote(file);
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

  if (shouldFocusNote) await focusOrOpenNote(newNote.path);
  return await getNoteDetails(newNote.path);
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const { file, content, silent } = params;
  const belowHeadline = params["below-headline"];
  const shouldCreateNote = params["create-if-not-found"];
  const shouldEnsureNewline = params["ensure-newline"];
  const shouldFocusNote = !silent;

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function appendAsRequested() {
    if (belowHeadline) {
      return await appendNoteBelowHeadline(file, belowHeadline, content);
    }

    return await appendNote(file, content, shouldEnsureNewline);
  }

  // If the file exists, append to it. Otherwise, check if we're supposed to
  // create it.
  const res = await getNoteFile(file);
  if (res.isSuccess) {
    const res1 = await appendAsRequested();
    if (res1.isSuccess) {
      if (shouldFocusNote) await focusOrOpenNote(file);
      return success({ message: res1.result }, file);
    }
    return res1;
  } else if (!shouldCreateNote) {
    return res;
  }

  // We're supposed to create the note. We try to create it.
  const res2 = await createNote(file, "");
  if (!res2.isSuccess) return res2;

  // Creation was successful. We try to append again.
  const res3 = await appendAsRequested();
  if (!res3.isSuccess) return res3;
  if (shouldFocusNote) await focusOrOpenNote(file);
  return success({ message: res3.result }, file);
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const { file, content, silent } = params;
  const belowHeadline = params["below-headline"];
  const shouldCreateNote = params["create-if-not-found"];
  const shouldEnsureNewline = params["ensure-newline"];
  const shouldFocusNote = !silent;
  const shouldIgnoreFrontMatter = params["ignore-front-matter"];

  // DRY: This call is used twice below, and I don't want to mess things up by
  // forgetting a parameter or something in the future.
  async function prependAsRequested() {
    if (belowHeadline) {
      return await prependNoteBelowHeadline(
        file,
        belowHeadline,
        content,
        shouldEnsureNewline,
      );
    }

    return await prependNote(
      file,
      content,
      shouldEnsureNewline,
      shouldIgnoreFrontMatter,
    );
  }

  // If the file exists, append to it. Otherwise, check if we're supposed to
  // create it.
  const res = await getNoteFile(file);
  if (res.isSuccess) {
    const res1 = await prependAsRequested();
    if (res1.isSuccess) {
      if (shouldFocusNote) await focusOrOpenNote(file);
      return success({ message: res1.result }, file);
    }
    return res1;
  } else if (!shouldCreateNote) {
    return res;
  }

  // We're supposed to create the note. We try to create it.
  const res2 = await createNote(file, "");
  if (!res2.isSuccess) return res2;

  // Creation was successful. We try to append again.
  const res3 = await prependAsRequested();
  if (!res3.isSuccess) return res3;
  if (shouldFocusNote) await focusOrOpenNote(file);
  return success({ message: res3.result }, file);
}

async function handleTouch(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file, silent } = <TouchParams> incomingParams;
  const shouldFocusNote = !silent;

  const res = await touchNote(file);
  if (!res.isSuccess) return res;
  if (shouldFocusNote) await focusOrOpenNote(file);
  return success({ message: STRINGS.touch_done }, file);
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { search, file, replace, silent } =
    <SearchAndReplaceParams> incomingParams;
  const filepath = file.path;
  const shouldFocusNote = !silent;

  const res = await searchAndReplaceInNote(filepath, search, replace);
  if (!res.isSuccess) return res;
  if (shouldFocusNote) await focusOrOpenNote(filepath);
  return success({ message: res.result }, filepath);
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { search, file, replace, silent } =
    <SearchAndReplaceParams> incomingParams;
  const filepath = file.path;
  const shouldFocusNote = !silent;

  const resSir = parseStringIntoRegex(search);
  if (!resSir.isSuccess) return resSir;

  const res = await searchAndReplaceInNote(filepath, resSir.result, replace);
  if (!res.isSuccess) return res;
  if (shouldFocusNote) await focusOrOpenNote(filepath);
  return success({ message: res.result }, filepath);
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const filepath = file.path;

  const res = await trashFilepath(filepath, true);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const filepath = file.path;

  const res = await trashFilepath(filepath);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <RenameParams> incomingParams;
  const filepath = params.file.path;

  const res = await renameFilepath(filepath, params["new-filename"]);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}
