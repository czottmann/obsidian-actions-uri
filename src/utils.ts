import { extname, normalize as pathNormalize } from "path";
import { Notice } from "obsidian";

// Make sure user-submitted file paths are relative to the vault root and the
// path is normalized
export function sanitizeFilePath(filename: string) {
  return pathNormalize(filename).replace(/^[\/\.]+/, "");
}

export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}

export function addMD(filename: string) {
  return extname(filename).toLowerCase() === ".md"
    ? filename
    : `${filename}.md`;
}
