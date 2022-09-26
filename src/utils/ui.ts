import { FileView, Notice } from "obsidian";
import { StringResultObject } from "../types";

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
 * Finds an open file with the passed-in filepath and focusses it.  When the
 * file isn't open, it does nothing.
 *
 * @param filepath - The path to the file to be focussed
 *
 * @returns Success on "file found and focussed", error on "file not found"
 */
export function focusLeafWithFile(filepath: string): StringResultObject {
  const { workspace } = global.app;
  const leaf = workspace.getLeavesOfType("markdown").find((leaf) =>
    (<FileView> leaf.view).file.path === filepath
  );

  if (!leaf) {
    return <StringResultObject> {
      isSuccess: false,
      error: "file not open",
    };
  }

  workspace.setActiveLeaf(leaf, true, true);
  return <StringResultObject> {
    isSuccess: true,
    result: "done",
  };
}

export function focusOrOpenNote(filepath: string) {
  // Is this file open already? If so, can we just focus it?
  const res = focusLeafWithFile(filepath);
  if (res.isSuccess) return;

  // Let's open the file then in the simplest way possible.
  window.open(
    "obsidian://open?" +
      "vault=" + encodeURIComponent(global.app.vault.getName()) +
      "&file=" + encodeURIComponent(filepath),
  );
}
