import { apiVersion } from "obsidian";
import { FileView, Notice } from "obsidian";
import { STRINGS } from "../constants";
import { StringResultObject } from "../types";
import { getNoteFile } from "./file-handling";

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
 * Finds an open file with the passed-in filepath and focusses it.  When the
 * file isn't open, it does nothing.
 *
 * @param filepath - The path to the file to be focussed
 *
 * @returns Success when file could be found and focussed, error otherwise
 */
export function focusLeafWithFile(filepath: string): StringResultObject {
  const { workspace } = window.app;
  const leaf = workspace.getLeavesOfType("markdown")
    .find((leaf) => (<FileView> leaf.view).file?.path === filepath);

  if (!leaf) {
    return {
      isSuccess: false,
      errorCode: 405,
      errorMessage: "File currently not open",
    };
  }

  workspace.setActiveLeaf(leaf, { focus: true });

  return {
    isSuccess: true,
    result: "Open file found and focussed",
  };
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
  const res = focusLeafWithFile(filepath);
  if (res.isSuccess) {
    return res;
  }

  const res1 = await getNoteFile(filepath);
  if (res1.isSuccess) {
    window.app.workspace.getLeaf(true).openFile(res1.result);
    return {
      isSuccess: true,
      result: STRINGS.open.note_opened,
    };
  }

  return {
    isSuccess: false,
    errorCode: 404,
    errorMessage: STRINGS.note_not_found,
  };
}
