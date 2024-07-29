import {
  MarkdownView,
  normalizePath,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import { STRINGS } from "src/constants";
import { self } from "src/utils/self";
import {
  getEnabledCorePlugin,
  isCommunityPluginEnabled,
  isCorePluginEnabled,
} from "src/utils/plugins";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import {
  endStringWithNewline,
  escapeRegExpChars,
  extractNoteContentParts,
  unwrapFrontMatter,
} from "src/utils/string-handling";
import { pause } from "src/utils/time";
import {
  BooleanResultObject,
  NoteDetailsResultObject,
  NoteProperties,
  RealLifeVault,
  StringResultObject,
  TFileResultObject,
} from "src/types";
import {
  focusOrOpenFile,
  logErrorToConsole,
  showBrandedNotice,
} from "src/utils/ui";

/**
 * Create a new note. If the note already exists, find a available numeric
 * suffix for the filename and create a new note with that suffix.
 *
 * @example
 * - `test.md` exists → `test 1.md`
 * - `test 1.md` exists → `test 2.md`
 *
 * @param filepath - A full filename, relative from vault root
 * root
 * @param content - The body of the note to be created
 *
 * @returns The created file
 *
 * @remarks
 * The `filename` parameter will be sanitized and suffixed with the file
 * extension `.md` if it is not already present.
 */
export async function createNote(
  filepath: string,
  content: string,
): Promise<TFileResultObject> {
  filepath = sanitizeFilePath(filepath);
  const vault = self().app.vault;
  let file = vault.getAbstractFileByPath(filepath);
  let doesFileExist = file instanceof TFile;

  if (doesFileExist) {
    // Add a numeric suffix to the filename (w/o its extension), and see whether
    // the filename is available. Make sure to honor an existing suffix by
    // starting to increment from there, eg. `test.md` → `test 1.md`,
    // `test 17.md` → `test 18.md`, etc.
    const currentNumSuffix: string | undefined =
      (<RegExpMatchArray> filepath.match(/( (\d+))?\.md$/))[2];
    let numSuffix = currentNumSuffix ? +currentNumSuffix : 0;

    do {
      numSuffix++;
      filepath = filepath.replace(/( \d+)?\.md$/, ` ${numSuffix}.md`);
      file = vault.getAbstractFileByPath(filepath);
      doesFileExist = file instanceof TFile;
    } while (doesFileExist);
  }

  // Create folder if necessary
  await createFolderIfNecessary(dirname(filepath));

  // Create the new note
  await createAndPause(filepath, content);

  const newFile = vault.getAbstractFileByPath(filepath);
  return (newFile instanceof TFile)
    ? success(newFile)
    : failure(ErrorCode.UnableToWrite, STRINGS.unable_to_write_note);
}

/**
 * Create a new note. If the note already exists, overwrite its content.
 *
 * @param filepath - A full filename, including the path relative from vault
 * root
 * @param content - The body of the note to be created
 *
 * @returns The created file
 *
 * @remarks
 * The `filename` parameter will be sanitized and suffixed with the file
 * extension `.md` if it is not already present.
 */
export async function createOrOverwriteNote(
  filepath: string,
  content: string,
): Promise<TFileResultObject> {
  filepath = sanitizeFilePath(filepath);
  const vault = self().app.vault;
  const file = vault.getAbstractFileByPath(filepath);

  // Update the file if it already exists, but give any other creation-hooked
  // functions some time to do their things first
  if (file instanceof TFile) {
    await pause(500);
    await vault.modify(file, content);
    return success(<TFile> vault.getAbstractFileByPath(filepath));
  }

  // Create the new note
  await createFolderIfNecessary(dirname(filepath));
  await createAndPause(filepath, content);
  const newFile = vault.getAbstractFileByPath(filepath);
  return (newFile instanceof TFile)
    ? success(newFile)
    : failure(ErrorCode.UnableToWrite, STRINGS.unable_to_write_note);
}

/**
 * Fetches an existing note and returns its content.
 *
 * @param filepath - A full filename, relative from vault root
 *
 * @returns A result object. Success case: note body, failure case: readable
 * error message
 */
export async function getNoteContent(
  filepath: string,
): Promise<StringResultObject> {
  const vault = self().app.vault;
  const res = await getNote(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const noteContent = await vault.read(res.result);
  return (typeof noteContent === "string")
    ? success(noteContent)
    : failure(ErrorCode.UnableToWrite, STRINGS.unable_to_read_note);
}

/**
 * Fetches an existing note and returns its split-up contents.
 *
 * @param filepath - A full filename, relative from vault root
 *
 * @returns A result object. Success case: note path, content, body and front
 * matter; failure case: readable error message
 */
export async function getNoteDetails(
  filepath: string,
): Promise<NoteDetailsResultObject> {
  const res = await getNote(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const res2 = await getNoteContent(filepath);
  if (!res2.isSuccess) {
    return res2;
  }

  const file = res.result;
  const content = res2.result;
  const { body, frontMatter } = extractNoteContentParts(content);
  const properties = propertiesForFile(file);
  return success({
    filepath,
    content,
    body,
    frontMatter: unwrapFrontMatter(frontMatter),
    properties,
    uid: properties[self().settings.frontmatterKey] as string | string[] || "",
  });
}

/**
 * Make sure user-submitted file paths are relative to the vault root and the
 * path is normalized and sanitized. Returned paths will never start with dots
 * or slashes.
 *
 * @param filename - A full file path
 * @param isNote - Whether the path is a note; if `true`, ensure the path ends
 *                 in `.md`/`.canvas`, otherwise leave the path alone.
 *                 Default: `true`
 *
 * @returns A normalized file path relative to the vault root
 */
export function sanitizeFilePath(
  filename: string,
  isNote: boolean = true,
): string {
  filename = filename.replace(/[:#^[]|]/g, "-");
  filename = normalizePath(filename)
    .split("/")
    .map((seg) => seg.trim())
    .join("/")
    .replace(/^[\/\.]+/g, "");

  return (isNote && !/\.(md|canvas)/i.test(extname(filename)))
    ? `${filename}.md`
    : filename;
}

/**
 * Make sure user-submitted file paths are relative to the vault root and the
 * path is normalized and sanitized. Returned paths will never start with dots
 * or slashes.
 *
 * @param filename - A full file path
 * @param isNote - Whether the path is a note; if `true`, ensure the path ends
 *                 in `.md`/`.canvas`, otherwise leave the path alone.
 *                 Default: `true`
 */
export function sanitizeFilePathAndGetAbstractFile(
  path: string,
  isNote: boolean = true,
): TAbstractFile | null {
  return self().app.vault.getAbstractFileByPath(sanitizeFilePath(path, isNote));
}

/**
 * Replaces the front matter and/or body of an existing note and returns its new
 * split-up contents.
 *
 * @param filepath - A full filename, relative from vault root
 * @param newFrontMatter - The new front matter to use. If not specified, the
 *                         existing front matter will be kept. An empty string
 *                         will clear any existing front matter.
 * @param newBody - The new body to use. If not specified, the existing body
 *                  will be kept. An empty string will remove the existing body.
 *
 * @returns A result object. Success case: note path, content, body and front
 * matter; failure case: readable error message
 */
export async function updateNote(
  filepath: string,
  newFrontMatter?: string,
  newBody?: string,
): Promise<NoteDetailsResultObject> {
  const res = await getNote(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const res2 = await getNoteDetails(filepath);
  if (!res2.isSuccess) {
    return res2;
  }

  // If both newFrontMatter and newBody are undefined, there's nothing to do.
  if (typeof newFrontMatter !== "string" && typeof newBody !== "string") {
    return res2;
  }

  const file = res.result;
  const noteDetails = res2.result;
  const body = (typeof newBody === "string") ? newBody : noteDetails.body;
  let frontMatter = (typeof newFrontMatter === "string")
    ? newFrontMatter
    : noteDetails.frontMatter;
  frontMatter = frontMatter.trim();

  const newNoteContent = frontMatter !== ""
    ? ["---", frontMatter, "---", body].join("\n")
    : body;

  await self().app.vault.modify(file, newNoteContent);

  // Without this delay, `propertiesForFile()` will return outdated properties.
  await pause(200);
  const properties = propertiesForFile(file);

  return success({
    filepath,
    content: newNoteContent,
    body,
    frontMatter,
    properties,
    uid: properties[self().settings.frontmatterKey] as string | string[] || "",
  });
}

/**
 * Sets the modification time of the file to now.
 *
 * @param filepath - A full filename, relative from vault root
 *
 * @returns A `StringResultObject` object containing either an `error` string or
 * `result` string
 */
export async function touchNote(
  filepath: string,
): Promise<TFileResultObject> {
  const res = await getNote(filepath);
  if (!res.isSuccess) return res;

  const res2 = await getNoteDetails(filepath);
  if (!res2.isSuccess) return res2;

  await self().app.vault.modify(res.result, res2.result.content);
  return res;
}

/**
 * @param filepath - A full filename, relative from vault root
 * @param searchTerm - The term to search for
 * @param replacement - The term to replace the search term with
 * @returns A `StringResultObject` object containing either an `error` string or
 * `result` string
 */
export async function searchAndReplaceInNote(
  filepath: string,
  searchTerm: string | RegExp,
  replacement: string,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const noteContent = res.result;
  const newContent = (typeof searchTerm === "string")
    ? noteContent.replaceAll(searchTerm, replacement)
    : noteContent.replace(searchTerm, replacement);

  if (noteContent === newContent) {
    return (typeof searchTerm === "string")
      ? success(STRINGS.search_string_not_found)
      : success(STRINGS.search_pattern_not_found);
  }

  const resFile = await createOrOverwriteNote(filepath, newContent);
  return resFile.isSuccess ? success(STRINGS.replacement_done) : resFile;
}

export async function appendNote(
  filepath: string,
  textToAppend: string,
  shouldEnsureNewline: boolean = false,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const newContent = res.result +
    (shouldEnsureNewline ? endStringWithNewline(textToAppend) : textToAppend);
  const resFile = await createOrOverwriteNote(filepath, newContent);

  if (resFile.isSuccess) {
    return success(STRINGS.append_done);
  }

  return resFile;
}

export async function appendNoteBelowHeadline(
  filepath: string,
  belowHeadline: string,
  textToAppend: string,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const headlineRegex = new RegExp(
    `^${escapeRegExpChars(belowHeadline.trim())}\\s*\\n`,
    "s",
  );

  // Split into sections by headline, find the section below the specified
  // headline, and append the text to that section
  const newContent = res.result
    .split(/(?=^#+ )/m)
    .map((section) => {
      if (!headlineRegex.test(section)) {
        return section;
      }

      // Rebuild the section by trimming it, appending the text, and adding back
      // the original number of consecutive newlines
      return endStringWithNewline(
        section.trim() +
            "\n" +
            textToAppend +
            section.match(/\n+$/)?.[0] || "",
      );
    })
    .join("");

  const resFile = await createOrOverwriteNote(filepath, newContent);
  if (resFile.isSuccess) {
    return success(STRINGS.append_done);
  }

  return resFile;
}

export async function prependNote(
  filepath: string,
  textToPrepend: string,
  shouldEnsureNewline: boolean = false,
  shouldIgnoreFrontMatter: boolean = false,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const noteContent = res.result;
  let newContent: string;

  if (shouldEnsureNewline) {
    textToPrepend = endStringWithNewline(textToPrepend);
  }

  if (shouldIgnoreFrontMatter) {
    newContent = textToPrepend + noteContent;
  } else {
    const { frontMatter, body } = extractNoteContentParts(noteContent);
    newContent = frontMatter + textToPrepend + body;
  }

  const resFile = await createOrOverwriteNote(filepath, newContent);
  return resFile.isSuccess ? success(STRINGS.prepend_done) : resFile;
}

export async function prependNoteBelowHeadline(
  filepath: string,
  belowHeadline: string,
  textToPrepend: string,
  shouldEnsureNewline: boolean = false,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const headlineRegex = new RegExp(
    `^${escapeRegExpChars(belowHeadline.trim())}\\s*\\n`,
    "s",
  );

  // Split into sections by headline, find the section below the specified
  // headline, and prepend the text to that section
  const newContent = res.result
    .split(/(?=^#+ )/m)
    .map((section) => {
      if (!headlineRegex.test(section)) {
        return section;
      }

      if (shouldEnsureNewline) {
        textToPrepend = endStringWithNewline(textToPrepend);
      }

      const prependedSection = section.split("\n");
      prependedSection[1] = textToPrepend + (prependedSection[1] || "");
      const newSection = prependedSection.join("\n");

      return endStringWithNewline(newSection);
    })
    .join("");

  const resFile = await createOrOverwriteNote(filepath, newContent);
  if (resFile.isSuccess) {
    return success(STRINGS.append_done);
  }

  return resFile;
}

/**
 * Gets the list of all files and folders in the vault.
 *
 * @returns An array of `TFile` instances
 */
export function getFileMap(): TFile[] {
  const vault = self().app.vault;
  const { fileMap } = <RealLifeVault> vault;
  return Object.values(fileMap);
}

/**
 * Checks whether a particular file exists and when it does, returns its `TFile`
 * instance.
 *
 * @param filepath - A full filename
 *
 * @returns A result object containing either an error or the `TFile`.
 */
export async function getFile(
  filepath: string,
): Promise<TFileResultObject> {
  const cleanPath = sanitizeFilePath(filepath, false);
  const file = self().app.vault.getAbstractFileByPath(cleanPath);

  return file instanceof TFile
    ? success(file)
    : failure(ErrorCode.NotFound, STRINGS.note_not_found);
}

/**
 * Checks whether a particular note file exists and when it does, returns its
 * `TFile` instance.
 *
 * @param filepath - A full filename
 *
 * @returns A result object containing either an error or the `TFile`.
 */
export async function getNote(
  filepath: string,
): Promise<TFileResultObject> {
  const cleanPath = sanitizeFilePath(filepath);
  const file = self().app.vault.getAbstractFileByPath(cleanPath);

  return file instanceof TFile
    ? success(file)
    : failure(ErrorCode.NotFound, STRINGS.note_not_found);
}

/**
 * Opens or focusses a particular note, then applies a template to it, using the
 * core Templates plugin.
 *
 * @param templateFile - The template file to apply
 * @param note - The note to apply the template to
 * @returns A result object containing either an error or `true`.
 */
export async function applyCorePluginTemplate(
  templateFile: TAbstractFile,
  note: TFile,
): Promise<BooleanResultObject> {
  const pluginRes = getEnabledCorePlugin("templates");
  if (!pluginRes.isSuccess) return pluginRes;
  const pluginInstance = pluginRes.result;

  // The core plugin will only apply a template to the open, focussed, and
  // editable note ¯\_(ツ)_/¯
  await focusOrOpenFile(note.path);

  try {
    // Ensure the view is in source mode
    const activeView = self().app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView?.getMode() !== "source") {
      await activeView.setState(
        { ...activeView.getState(), mode: "source" },
        { history: false },
      );
    }
  } catch (error) {
    const msg = (<Error> error).message;
    showBrandedNotice(msg);
    logErrorToConsole(msg);
    return failure(ErrorCode.HandlerError, msg);
  }

  await pause(200);
  await pluginInstance.insertTemplate(templateFile);
  return success(true);
}

/**
 * Moves a particular file/folder to the trash or deletes it right away.
 *
 * @param filepath - A full filename
 * @param deleteImmediately - Whether the file should be deleted immediately
 * (`true`) or moved to the preferred trash location (`false`, default)
 *
 * @returns A result object containing either an error or a success message.
 */
export async function trashFilepath(
  filepath: string,
  deleteImmediately: boolean = false,
): Promise<StringResultObject> {
  const vault = self().app.vault;
  const fileOrFolder = vault.getAbstractFileByPath(filepath);

  if (!fileOrFolder) {
    return failure(ErrorCode.NotFound, STRINGS.not_found);
  }

  if (deleteImmediately) {
    await vault.delete(fileOrFolder, true);
  } else {
    const isSystemTrashPreferred =
      (<any> vault).config?.trashOption === "system";
    await vault.trash(fileOrFolder, isSystemTrashPreferred);
  }

  return success(STRINGS.trash_done);
}

/**
 * Renames or moves a file/folder.
 *
 * @param filepath - A full filename
 * @param newFilepath - A full filename
 *
 * @returns A result object containing either an error or a success message.
 */
export async function renameFilepath(
  filepath: string,
  newFilepath: string,
): Promise<StringResultObject> {
  const vault = self().app.vault;
  const fileOrFolder = vault.getAbstractFileByPath(filepath);

  if (!fileOrFolder) {
    return failure(ErrorCode.NotFound, STRINGS.not_found);
  }

  try {
    await vault.rename(fileOrFolder, newFilepath);
  } catch (error) {
    const msg = (<Error> error).message;
    return failure(
      ErrorCode.NotFound,
      msg.contains("no such file or directory")
        ? "No such file or folder"
        : msg,
    );
  }

  return success(STRINGS.rename_done);
}

/**
 * Creates a folder but checks for its existence before attempting creation.
 * We're civilized people here.
 *
 * @param folder - A folder path relative from the vault root
 */
export async function createFolderIfNecessary(folder: string) {
  const vault = self().app.vault;
  folder = sanitizeFilePath(folder, false);

  if (folder === "" || folder === ".") return;
  // Back off if the folder already exists
  if (vault.getAbstractFileByPath(folder) instanceof TFolder) return;
  await vault.createFolder(folder);
}

/**
 * Returns the frontmatter properties for a given file.
 * @param file - The file to retrieve properties for.
 * @returns An object containing the frontmatter properties of the file, or an
 *          empty object if none exist.
 */
export function propertiesForFile(file: TAbstractFile): NoteProperties {
  return self().app.metadataCache.getFileCache(file)?.frontmatter || {};
}

// HELPERS ----------------------------------------

/**
 * Necessary for preventing a race condition when creating an empty note in a
 * folder that is being watched by either templates plugin.
 *
 * @param filepath - A full filename, including the path relative from vault
 * root
 * @param content - The body of the note to be created
 *
 * @remarks
 * See issue #61 at https://github.com/czottmann/obsidian-actions-uri/issues/61
 */
async function createAndPause(filepath: string, content: string) {
  // Create the new note
  await self().app.vault.create(filepath, content);

  if (
    isCorePluginEnabled("templates") ||
    isCommunityPluginEnabled("templater-obsidian")
  ) {
    await pause(500);
  }
}

/**
 * Returns the directory name of a `path`, as a bare-bones replacement for
 * Node's `path.dirname`.
 *
 * @param path - A file path
 *
 * @returns Directory name of the input `path`
 */
function dirname(path: string) {
  path = normalizePath(path);
  return path.indexOf("/") === -1 ? "." : path.replace(/\/[^/]*$/, "");
}

/**
 * Returns the extension of the `path`, from the last occurrence of the `.`
 * (period) character to end of string in the last portion of the `path`. If
 * there is no `.` in the last portion of the `path`, or if there are no `.`
 * characters other than the first character of the basename of `path`, an empty
 * string is returned.
 *
 * @param path - A file path
 *
 * @returns Filename extension of the input `path`
 */
function extname(path: string) {
  const filename = normalizePath(path).split("/").pop() || "";
  return filename.includes(".") ? `.${filename.split(".").pop()}` : "";
}
