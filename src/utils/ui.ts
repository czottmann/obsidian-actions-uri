import { FileView, Notice, requireApiVersion } from "obsidian";
import { STRINGS } from "src/constants";
import { StringResultObject } from "src/types";
import { getFile } from "src/utils/file-handling";
import { self } from "src/utils/self";
import { ErrorCode, failure, success } from "src/utils/results-handling";

/**
 * Displays a `Notice` inside Obsidian. The notice is prefixed with
 * "[Actions URI]" so the sender is clear to the receiving user.
 *
 * @param msg - The message to be shown in the notice
 */
export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}

/**
 * Logs anything to the console, prefixed with "[Actions URI]" so the sender is
 * clear.  Standard log level.
 *
 * @param data - Anything that can be logged, really
 */
export function logToConsole(...data: any[]) {
  console.log("[Actions URI]", ...data);
}

/**
 * Logs anything to the console, prefixed with "[Actions URI]" so the sender is
 * clear.  Error log level.
 *
 * @param data - Anything that can be logged, really
 */
export function logErrorToConsole(...data: any[]) {
  console.error("[Actions URI]", ...data);
}

/**
 * Given a file path, the function will check whether the note file is already
 * open and then focus it, or it'll open the note.
 *
 * @param filepath - The path to the file to be focussed or opened
 *
 * @returns A positive string result object specifying the action taken
 */
export async function focusOrOpenNote(
  filepath: string,
): Promise<StringResultObject> {
  // Is this file open already? If so, can we just focus it?
  const res = await revealLeafWithFilePath(filepath);
  if (res.isSuccess) {
    return res;
  }

  const res1 = await getFile(filepath);
  if (res1.isSuccess) {
    self().app.workspace.getLeaf(true).openFile(res1.result);
    return success(STRINGS.note_opened);
  }

  return failure(ErrorCode.NotFound, STRINGS.note_not_found);
}

/**
 * Finds an open note with the passed-in filepath. If it's found, it'll be
 * revealed, otherwise nothing happens.
 *
 * @param filepath - The path to the file to be focussed
 *
 * @returns Success when note could be found and focussed, error otherwise
 */
async function revealLeafWithFilePath(
  filepath: string,
): Promise<StringResultObject> {
  for (let leaf of self().app.workspace.getLeavesOfType("markdown")) {
    // See https://publish.obsidian.md/dev-docs-test/Plugins/Guides/Understanding+deferred+views
    if (requireApiVersion("1.7.2")) {
      // @ts-ignore
      await leaf.loadIfDeferred();
    }

    if (leaf.view instanceof FileView && leaf.view.file?.path === filepath) {
      await self().app.workspace.revealLeaf(leaf);
      return success("Open file found and focussed");
    }
  }

  return failure(ErrorCode.NotFound, "File currently not open");
}
