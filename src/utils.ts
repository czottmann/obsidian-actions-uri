import { Notice } from "obsidian";
import { extname, normalize as pathNormalize } from "path";

// Make sure user-submitted file paths are relative to the vault root and the
// path is normalized and cleaned up
export function sanitizeFilePath(filename: string) {
  return pathNormalize(filename)
    .replace(/^[\/\.]+/, "")
    .trim();
}

export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}

export function addMD(filename: string) {
  return extname(filename).toLowerCase() === ".md"
    ? filename
    : `${filename}.md`;
}
