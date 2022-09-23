import { Notice } from "obsidian";
import { extname, normalize as pathNormalize } from "path";

// Make sure user-submitted file paths are relative to the vault root and the
// path is normalized and cleaned up
export function sanitizeFilePath(filename: string): string {
  filename = pathNormalize(filename)
    .replace(/^[\/\.]+/, "")
    .trim();
  filename = extname(filename).toLowerCase() === ".md"
    ? filename
    : `${filename}.md`;
  return filename;
}

export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}
