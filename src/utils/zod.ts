import { z } from "zod";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import { activeVault } from "./file-handling";
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

export const zodSanitizedNotePath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file));

export const zodSanitizedFilePath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file, false));

export const zodSanitizedFolderPath = z.string()
  .min(1, { message: "can't be empty" })
  .transform((file) => sanitizeFilePath(file, false));

/**
 * A schema which expects a string containing a JSON-encoded array of strings,
 * and which will return the parsed array of strings.
 */
export const zodJsonStringArray = z.string()
  .refine((str) => {
    try {
      const value = JSON.parse(str);
      return Array.isArray(value) &&
        value.every((item) => typeof item === "string");
    } catch (error) {
      return false;
    }
  }, {
    message: "Input must be a JSON-encoded string array.",
  })
  .transform((str) => JSON.parse(str));

/**
 * A schema which expects a string containing a JSON-encoded object containing
 * only values of type `string`, `string[]`, `number`, `boolean` or `null`.
 * Return the object if valid.
 */
export const zodJsonPropertiesObject = z.string()
  .refine((str) => {
    try {
      const value = JSON.parse(str);

      if (typeof value !== "object") {
        return false;
      }

      const isValid = Object.values(value)
        .every((item) => {
          const type = typeof item;
          if (["string", "number", "boolean"].includes(type) || item === null) {
            return true;
          }

          if (Array.isArray(item)) {
            return item.every((subItem) => typeof subItem === "string");
          }

          return false;
        });

      return isValid;
    } catch (error) {
      return false;
    }
  }, {
    message:
      "Input must be a JSON-encoded object containing only values of type string, string array, number, boolean or null.",
  })
  .transform((str) => JSON.parse(str));

/**
 * A schema which expects a comma-separated list of strings, and which will
 * return the parsed array of strings.
 */
export const zodCommaSeparatedStrings = z.string()
  .min(1, { message: "can't be empty" })
  .transform((str) => str.split(",").map((item) => item.trim()));

/**
 * A schema which tests the passed-in string to see if it's a valid path to an
 * existing note. If it is, returns a `TFile` instance.
 */
export const zodExistingNotePath = z.preprocess(
  lookupAbstractFileForNotePath,
  z.instanceof(TFile, { message: "Note doesn't exist" }),
);

/**
 * A schema which tests the passed-in string to see if it's a valid path to an
 * existing file. If it is, returns a `TFile` instance.
 */
export const zodExistingFilePath = z.preprocess(
  lookupAbstractFileForFilePath,
  z.instanceof(TFile, { message: "File doesn't exist" }),
);

/**
 * A schema which tests the passed-in string to see if it's a valid path to an
 * existing folder. If it is, returns a `TFolder` instance.
 */
export const zodExistingFolderPath = z.preprocess(
  lookupAbstractFolderForPath,
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

/**
 * A schema which expects an undefined value (i.e. no parameter passed in), and
 * returns a default value instead.
 *
 * @param defaultValue The default value to return if the parameter is undefined
 */
export const zodUndefinedChangedToDefaultValue = (defaultValue: any) =>
  z.undefined()
    .refine((val) => val === undefined)
    .transform(() => defaultValue);

/**
 * A schema which expects an empty string, and overwrites it with a given value.
 *
 * @param defaultString The default value to return if the parameter is undefined
 */
export const zodEmptyStringChangedToDefaultString = (defaultString: string) =>
  z.literal("")
    .refine((val) => val === "")
    .transform(() => defaultString);

// HELPERS ----------------------------------------

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing note.
 * Otherwise returns `null`.
 *
 * @param path Any incoming zod parameter
 */
function lookupAbstractFileForNotePath(path: any): TAbstractFile | null {
  if (typeof path !== "string" || !path) {
    return null;
  }

  const filepath = sanitizeFilePath(path as string);
  return activeVault().getAbstractFileByPath(filepath);
}

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing file or
 * folder. Otherwise returns `null`.
 *
 * @param path Any incoming zod parameter
 */
function lookupAbstractFileForFilePath(path: any): TAbstractFile | null {
  if (typeof path !== "string" || !path) {
    return null;
  }

  const filepath = sanitizeFilePath(path as string, false);
  return activeVault().getAbstractFileByPath(filepath);
}

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing file or
 * folder. Otherwise returns `null`.
 *
 * @param path Any incoming zod parameter
 */
function lookupAbstractFolderForPath(path: any): TAbstractFile | null {
  if (typeof path !== "string" || !path) {
    return null;
  }

  return activeVault().getAbstractFileByPath(path as string);
}
