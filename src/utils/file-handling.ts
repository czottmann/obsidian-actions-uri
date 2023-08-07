import { normalizePath, TFile, TFolder } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  getAllDailyNotes,
  getDailyNote,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "../constants";
import { isCommunityPluginEnabled } from "./plugins";
import { failure, success } from "./results-handling";
import {
  endStringWithNewline,
  extractNoteContentParts,
  unwrapFrontMatter,
} from "./string-handling";
import { pause } from "./time";
import {
  NoteDetailsResultObject,
  RealLifeVault,
  StringResultObject,
  TFileResultObject,
} from "../types";

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
  const { vault } = window.app;
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
    : failure(400, STRINGS.unable_to_write_note);
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
  const { vault } = window.app;
  const file = vault.getAbstractFileByPath(filepath);

  // Update the file if it already exists
  if (file instanceof TFile) {
    await vault.modify(file, content);
    return success(<TFile> vault.getAbstractFileByPath(filepath));
  }

  // Create the new note
  await createFolderIfNecessary(dirname(filepath));
  await createAndPause(filepath, content);
  const newFile = vault.getAbstractFileByPath(filepath);
  return (newFile instanceof TFile)
    ? success(newFile)
    : failure(400, STRINGS.unable_to_write_note);
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
  const { vault } = window.app;
  const res = await getNoteFile(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const noteContent = await vault.read(res.result);
  return (typeof noteContent === "string")
    ? success(noteContent)
    : failure(400, STRINGS.unable_to_read_note);
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
  const res = await getNoteContent(filepath);
  if (!res.isSuccess) {
    return res;
  }

  const content = res.result;
  const { body, frontMatter } = extractNoteContentParts(content);
  return success(
    {
      filepath,
      content,
      body,
      frontMatter: unwrapFrontMatter(frontMatter),
    },
    filepath,
  );
}

/**
 * Make sure user-submitted file paths are relative to the vault root and the
 * path is normalized and sanitized. Returned paths will never start with dots
 * or slashes.
 *
 * @param filename - A full file path
 * @param isFolder - Whether the path is a folder path; if `true`, make sure the
 * path ends in `.md`. Default: `false`
 *
 * @returns A normalized file path relative to the vault root
 */
export function sanitizeFilePath(
  filename: string,
  isFolder: boolean = false,
): string {
  filename = filename.replace(/[:#^[]|]/g, "-");
  filename = normalizePath(filename)
    .split("/")
    .map((seg) => seg.trim())
    .join("/")
    .replace(/^[\/\.]+/g, "");

  return (isFolder || extname(filename).toLowerCase() === ".md")
    ? filename
    : `${filename}.md`;
}

/**
 * @param filepath - A full filename, relative from vault root
 * @param searchTerm - The term to search for
 * @param replacement - The term to replace the search term with
 * @returns A `SimpleResult` object containing either an `error` string or a
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
    ? noteContent.replace(new RegExp(searchTerm, "g"), replacement)
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

  // Split into sections by headline, find the section below the specified
  // headline, and append the text to that section
  const newContent = res.result
    .split(/(?=^#+ )/m)
    .map((section) => {
      if (!section.startsWith(belowHeadline)) {
        return section;
      }

      // If the section doesn't end with a newline, add one before appending.
      // This case might occur if the last headline in the note is the one to
      // work with, and the file doesn't end with a newline.
      if (!section.includes("\n")) {
        section += "\n";
      }

      return endStringWithNewline(section + textToAppend);
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

  // Split into sections by headline, find the section below the specified
  // headline, and prepend the text to that section
  const newContent = res.result
    .split(/(?=^#+ )/m)
    .map((section) => {
      if (!section.startsWith(belowHeadline)) {
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

export function getCurrentDailyNote(): TFile | undefined {
  return getDailyNote(window.moment(), getAllDailyNotes());
}

/**
 * Checks if the daily note plugin is available, and gets the path to today's
 * daily note.
 *
 * @returns Successful `StringResultObject` containing the path if the DN
 * functionality is available and there is a current daily note. Unsuccessful
 * `StringResultObject` if it isn't.
 */
export function getDailyNotePathIfPluginIsAvailable(): StringResultObject {
  if (!appHasDailyNotesPluginLoaded()) {
    return failure(412, STRINGS.daily_notes_feature_not_available);
  }

  const dailyNote = getCurrentDailyNote();
  return dailyNote
    ? success(dailyNote.path)
    : failure(404, STRINGS.note_not_found);
}

/**
 * Gets the list of all files and folders in the vault.
 *
 * @returns An array of `TFile` instances
 */
export function getFileMap(): TFile[] {
  const { vault } = window.app;
  const { fileMap } = <RealLifeVault> vault;
  return Object.values(fileMap);
}

/**
 * Checks whether a particular file exists and when it does, returns its `TFile`
 * instance.
 *
 * @param filepath - A full filename
 *
 * @returns A result object containing either an error string or the `TFile`.
 */
export async function getNoteFile(
  filepath: string,
): Promise<TFileResultObject> {
  const { vault } = window.app;
  const file = vault.getAbstractFileByPath(sanitizeFilePath(filepath));

  return file instanceof TFile
    ? success(file)
    : failure(404, STRINGS.note_not_found);
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
  const { vault } = window.app;
  const fileOrFolder = vault.getAbstractFileByPath(filepath);

  if (!fileOrFolder) {
    return failure(404, STRINGS.not_found);
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
  const { vault } = window.app;
  const fileOrFolder = vault.getAbstractFileByPath(filepath);

  if (!fileOrFolder) {
    return failure(404, STRINGS.not_found);
  }

  try {
    await vault.rename(fileOrFolder, newFilepath);
  } catch (error) {
    const msg = (<Error> error).message;
    return failure(
      409,
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
  const { vault } = window.app;
  folder = sanitizeFilePath(folder, true);

  if (folder === "" || folder === ".") return;
  // Back off if the folder already exists
  if (vault.getAbstractFileByPath(folder) instanceof TFolder) return;
  await vault.createFolder(folder);
}

// HELPERS ----------------------------------------

/**
 *  Necessary for preventing a race condition when creating an empty note in a
 * folder that is being watched by the Templater plugin.
 *
 * @param filepath - A full filename, including the path relative from vault
 * root
 * @param content - The body of the note to be created
 *
 * @remarks
 * See issue #61 at
 * https://github.com/czottmann/obsidian-actions-uri/issues/61
 */
async function createAndPause(filepath: string, content: string) {
  // Create the new note
  await window.app.vault.create(filepath, content);

  if (isCommunityPluginEnabled("templater-obsidian")) {
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
