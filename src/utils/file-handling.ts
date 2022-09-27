import { dirname, extname, normalize } from "path";
import { TFile, TFolder } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  getAllDailyNotes,
  getDailyNote,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "../constants";
import { ensureNewline, extractNoteContentParts } from "./string-handling";
import { StringResultObject, TFileResultObject } from "../types";

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
): Promise<TFile> {
  filepath = sanitizeFilePath(filepath);
  const { vault } = global.app;
  let file = vault.getAbstractFileByPath(filepath);
  let doesFileExist = file instanceof TFile;

  if (doesFileExist) {
    // Add a numeric suffix to the filename (w/o its extension), and see whether
    // the filename is available. Make sure to honor an existing suffix by
    // starting to increment from there, eg. `test.md` → `test 1.md`,
    // `test 17.md` → `test 18.md`, etc.
    const currentNumSuffix: string | undefined =
      (filepath.match(/( (\d+))?\.md$/) as RegExpMatchArray)[2];
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
  await vault.create(filepath, content);
  return vault.getAbstractFileByPath(filepath) as TFile;
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
): Promise<TFile> {
  filepath = sanitizeFilePath(filepath);
  const { vault } = global.app;
  const file = vault.getAbstractFileByPath(filepath);
  const doesFileExist = file instanceof TFile;

  // Update the file if it already exists
  if (doesFileExist) {
    await vault.modify(file, content);
    return vault.getAbstractFileByPath(filepath) as TFile;
  }

  // Create the new note
  await createFolderIfNecessary(dirname(filepath));
  await vault.create(filepath, content);
  return vault.getAbstractFileByPath(filepath) as TFile;
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
  const { vault } = global.app;
  const file = vault.getAbstractFileByPath(sanitizeFilePath(filepath));
  const doesFileExist = file instanceof TFile;

  if (!doesFileExist) {
    return <StringResultObject> {
      isSuccess: false,
      error: STRINGS.note_not_found,
    };
  }

  const noteContent = await vault.read(file);
  return (typeof noteContent === "string")
    ? <StringResultObject> {
      isSuccess: true,
      result: noteContent,
    }
    : <StringResultObject> {
      isSuccess: false,
      error: STRINGS.unable_to_read_note,
    };
}

/**
 * Make sure user-submitted file paths are relative to the vault root and the
 * path is normalized and sanitized. Returned paths will never start with dots
 * or slashes.
 *
 * @param filename - A full file path
 *
 * @returns A normalized file path relative to the vault root
 */
export function sanitizeFilePath(filename: string): string {
  filename = normalize(filename)
    .replace(/^[\/\.]+/, "")
    .trim();
  filename = extname(filename).toLowerCase() === ".md"
    ? filename
    : `${filename}.md`;
  return filename;
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
    return <StringResultObject> { isSuccess: false, error: res.error };
  }

  const noteContent = res.result;
  const newContent = noteContent.replace(searchTerm, replacement);

  if (noteContent === newContent) {
    return <StringResultObject> {
      isSuccess: true,
      result: typeof searchTerm === "string"
        ? STRINGS.search_string_not_found
        : STRINGS.search_pattern_not_found,
    };
  }

  const updatedFile = await createOrOverwriteNote(filepath, newContent);
  return (updatedFile instanceof TFile)
    ? <StringResultObject> { isSuccess: true, result: STRINGS.replacement_done }
    : <StringResultObject> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
    };
}

export async function appendNote(
  filepath: string,
  textToAppend: string,
  shouldEnsureNewline: boolean = false,
): Promise<StringResultObject> {
  const res = await getNoteContent(filepath);

  if (!res.isSuccess) {
    return <StringResultObject> {
      isSuccess: false,
      error: res.error,
    };
  }

  const newContent = res.result +
    (shouldEnsureNewline ? ensureNewline(textToAppend) : textToAppend);
  const updatedFile = await createOrOverwriteNote(filepath, newContent);

  return (updatedFile instanceof TFile)
    ? <StringResultObject> {
      isSuccess: true,
      result: STRINGS.append_done,
    }
    : <StringResultObject> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
    };
}

export async function prependNote(
  filepath: string,
  textToPrepend: string,
  shouldEnsureNewline: boolean = false,
  shouldIgnoreFrontMatter: boolean = false,
): Promise<StringResultObject> {
  const { vault } = global.app;
  const res = await getNoteContent(filepath);

  if (!res.isSuccess) {
    return <StringResultObject> {
      isSuccess: false,
      error: res.error,
    };
  }

  const noteContent = res.result;
  let newContent: string;

  if (shouldEnsureNewline) {
    textToPrepend = ensureNewline(textToPrepend);
  }

  if (shouldIgnoreFrontMatter) {
    newContent = textToPrepend + noteContent;
  } else {
    const { frontMatter, body } = extractNoteContentParts(noteContent);
    newContent = frontMatter + textToPrepend + body;
  }

  const updatedFile = await createOrOverwriteNote(filepath, newContent);
  return (updatedFile instanceof TFile)
    ? <StringResultObject> {
      isSuccess: true,
      result: STRINGS.prepend_done,
    }
    : <StringResultObject> {
      isSuccess: false,
      error: STRINGS.unable_to_write_note,
    };
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
    return <StringResultObject> {
      isSuccess: false,
      error: STRINGS.daily_notes_feature_not_available,
    };
  }

  const dailyNote = getCurrentDailyNote();
  return dailyNote
    ? <StringResultObject> { isSuccess: true, result: dailyNote.path }
    : <StringResultObject> {
      isSuccess: false,
      error: STRINGS.daily_note.current_note_not_found,
    };
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
  const { vault } = global.app;
  const file = vault.getAbstractFileByPath(sanitizeFilePath(filepath));

  return file instanceof TFile
    ? <TFileResultObject> { isSuccess: true, result: file }
    : <TFileResultObject> { isSuccess: false, error: STRINGS.note_not_found };
}

// HELPERS ----------------------------------------

/**
 * Creates a folder but checks for its existence before attempting creation.
 * We're civilized people here.
 *
 * @param folder - A folder path relative from the vault root
 */
async function createFolderIfNecessary(folder: string) {
  const { vault } = global.app;

  if (folder === "" || folder === ".") return;
  // Back off if the folder already exists
  if (vault.getAbstractFileByPath(folder) instanceof TFolder) return;
  await vault.createFolder(folder);
}
