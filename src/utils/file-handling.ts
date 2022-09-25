import { dirname, extname, normalize } from "path";
import { TFile, TFolder, Vault } from "obsidian";
import { STRINGS } from "../constants";
import { SimpleResult } from "../types";

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
 * @param vault - The vault to create the note in
 *
 * @returns The created file
 *
 * @remarks
 * The `filename` parameter will be sanitized and suffixed with the file
 * extension `.md` if it is not already present.
 */
export async function createNote(
  filepath: string,
  vault: Vault,
  content: string,
): Promise<TFile> {
  filepath = sanitizeFilePath(filepath);
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
  await createFolderIfNecessary(dirname(filepath), vault);

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
 * @param vault - The vault to create the note in
 *
 * @returns The created file
 *
 * @remarks
 * The `filename` parameter will be sanitized and suffixed with the file
 * extension `.md` if it is not already present.
 */
export async function createOrOverwriteNote(
  filepath: string,
  vault: Vault,
  content: string,
): Promise<TFile> {
  filepath = sanitizeFilePath(filepath);
  const file = vault.getAbstractFileByPath(filepath);
  const doesFileExist = file instanceof TFile;

  // Update the file if it already exists
  if (doesFileExist) {
    await vault.modify(file, content);
    return vault.getAbstractFileByPath(filepath) as TFile;
  }

  // Create the new note
  await createFolderIfNecessary(dirname(filepath), vault);
  await vault.create(filepath, content);
  return vault.getAbstractFileByPath(filepath) as TFile;
}

/**
 * Fetches an existing note and returns its content.
 *
 * @param filepath - A full filename, relative from vault root
 * @param vault - The vault to search for the note in
 *
 * @returns A result object. Success case: note body, failure case: readable
 * error message
 */
export async function getNoteContent(
  filepath: string,
  vault: Vault,
): Promise<SimpleResult> {
  const file = vault.getAbstractFileByPath(sanitizeFilePath(filepath));
  const doesFileExist = file instanceof TFile;

  if (!doesFileExist) {
    return <SimpleResult> {
      isSuccess: false,
      error: STRINGS.note_not_found,
    };
  }

  const noteContent = await vault.read(file);
  return (typeof noteContent === "string")
    ? <SimpleResult> {
      isSuccess: true,
      result: noteContent,
    }
    : <SimpleResult> {
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
 * @param vault - The vault of the note
 * @param searchTerm - The term to search for
 * @param replacement - The term to replace the search term with
 * @returns A `SimpleResult` object containing either an `error` string or a
 * `result` string
 */
export async function searchAndReplaceInNote(
  filepath: string,
  vault: Vault,
  searchTerm: string | RegExp,
  replacement: string,
): Promise<SimpleResult> {
  const res = await getNoteContent(filepath, vault);

  if (!res.isSuccess) {
    return <SimpleResult> { isSuccess: false, error: res.error };
  }

  const noteContent = res.result;
  const newContent = noteContent.replace(searchTerm, replacement);

  if (noteContent === newContent) {
    return <SimpleResult> {
      isSuccess: true,
      result: typeof searchTerm === "string"
        ? STRINGS.search_string_not_found
        : STRINGS.search_pattern_not_found,
    };
  }

  const updatedFile = await createOrOverwriteNote(filepath, vault, newContent);
  return (updatedFile instanceof TFile)
    ? <SimpleResult> { isSuccess: true, result: STRINGS.replacement_done }
    : <SimpleResult> { isSuccess: false, error: STRINGS.unable_to_write_note };
}

// HELPERS ----------------------------------------

/**
 * Creates a folder but checks for its existence before attempting creation.
 * We're civilized people here.
 *
 * @param folder - A folder path relative from the vault root
 * @param vault - The vault to create the folder in
 */
async function createFolderIfNecessary(folder: string, vault: Vault) {
  if (folder === "" || folder === ".") return;
  // Back off if the folder already exists
  if (vault.getAbstractFileByPath(folder) instanceof TFolder) return;
  await vault.createFolder(folder);
}
