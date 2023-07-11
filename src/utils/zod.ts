import { z } from "zod";
import { normalizePath, TFile, TFolder } from "obsidian";
import { sanitizeFilePath } from "./file-handling";

// The absence of a parameter `blah`, a `blah=false` and a value-less `blah=`
// should all be treated as `false`. My reign shall be merciful.
export const zodOptionalBoolean = z.preprocess(
  (param: unknown): boolean => {
    if (typeof param === "string") {
      return param !== "false" && param !== "";
    }
    return false;
  },
  z.boolean().optional(),
);

export const zodSanitizedFilePath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file));

export const zodExistingFilePath = z.preprocess(
  (file) =>
    window.app.vault.getAbstractFileByPath(normalizePath(file as string)),
  z.instanceof(TFile, { message: "File doesn't exist" }),
);

export const zodSanitizedFolderPath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file, true));

export const zodExistingFolderPath = z.preprocess(
  (folder) =>
    window.app.vault.getAbstractFileByPath(normalizePath(folder as string)),
  z.instanceof(TFolder, { message: "Folder doesn't exist" }),
);

/**
 * An always-false boolean. Looks stupid but it's used by the handlers in
 * `../routes/open.ts`, see section "HANDLERS" there.
 */
export const zodAlwaysFalse = z.preprocess(
  (param: unknown): boolean => false,
  z.boolean().optional(),
);
