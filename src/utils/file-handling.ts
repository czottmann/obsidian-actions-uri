import { dirname, extname, normalize } from "path";
import { TFile, TFolder, Vault } from "obsidian";

/**
 * Create a new note. If the note already exists, find a available numeric
 * suffix for the filename and create a new note with that suffix.
 *
 * @example
 * - `test.md` exists → `test 1.md`
 * - `test 1.md` exists → `test 2.md`
 *
 * @param filename - A full filename, including the path relative from vault
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
  filename: string,
  content: string,
  vault: Vault,
): Promise<TFile> {
  filename = sanitizeFilePath(filename);
  let file = vault.getAbstractFileByPath(filename);
  let doesFileExist = file instanceof TFile;

  if (doesFileExist) {
    // Add a numeric suffix to the filename (w/o its extension), and see whether
    // the filename is available. Make sure to honor an existing suffix by
    // starting to increment from there, eg. `test.md` → `test 1.md`,
    // `test 17.md` → `test 18.md`, etc.
    const currentNumSuffix: string | undefined =
      (filename.match(/( (\d+))?\.md$/) as RegExpMatchArray)[2];
    let numSuffix = currentNumSuffix ? +currentNumSuffix : 0;

    do {
      numSuffix++;
      filename = filename.replace(/( \d+)?\.md$/, ` ${numSuffix}.md`);
      file = vault.getAbstractFileByPath(filename);
      doesFileExist = file instanceof TFile;
    } while (doesFileExist);
  }

  // Create folder if necessary
  await createFolderIfNecessary(dirname(filename), vault);

  // Create the new note
  await vault.create(filename, content);
  return vault.getAbstractFileByPath(filename) as TFile;
}

/**
 * Create a new note. If the note already exists, overwrite its content.
 *
 * @param filename - A full filename, including the path relative from vault
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
  filename: string,
  content: string,
  vault: Vault,
): Promise<TFile> {
  filename = sanitizeFilePath(filename);
  const file = vault.getAbstractFileByPath(filename);
  const doesFileExist = file instanceof TFile;

  // Update the file if it already exists
  if (doesFileExist) {
    await vault.modify(file, content);
    return vault.getAbstractFileByPath(filename) as TFile;
  }

  // Create the new note
  await createFolderIfNecessary(dirname(filename), vault);
  await vault.create(filename, content);
  return vault.getAbstractFileByPath(filename) as TFile;
}

/**
 * Fetches an existing note and returns its content.
 *
 * @param filename - A full filename, including the path relative from vault
 * @param vault - The vault to search for the note in
 *
 * @returns The note body, or `undefined` if the note does not exist
 */
export async function getNoteContent(
  filename: string,
  vault: Vault,
): Promise<string | undefined> {
  filename = sanitizeFilePath(filename);
  const file = vault.getAbstractFileByPath(filename);
  const doesFileExist = file instanceof TFile;

  if (doesFileExist) {
    return await vault.read(file);
  }

  return undefined;
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
