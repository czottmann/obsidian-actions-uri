import { FileView, Notice, Vault, Workspace, WorkspaceLeaf } from "obsidian";
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
 * @param workspace - The current Obsidian workspace
 *
 * @returns Success on "file found and focussed", error on "file not found"
 */
export function focusLeafWithFile(
  filepath: string,
  workspace: Workspace,
): StringResultObject {
  const leaf = workspace.getLeavesOfType("markdown").find((leaf) =>
    (<FileView> leaf.view).file?.path === filepath
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

// let fileIsAlreadyOpened = false;

// if (fileIsAlreadyOpened) {
//   const leaf = this.app.workspace.activeLeaf;
//   if (parameters.viewmode != undefined) {
//     let viewState = leaf.getViewState();
//     viewState.state.mode = parameters.viewmode;
//     if (viewState.state.source != undefined) {
//       viewState.state.source = parameters.viewmode == "source";
//     }
//     await leaf.setViewState(viewState);
//   }
// }
