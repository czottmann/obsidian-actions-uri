import { z } from "zod";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import { self } from "src/utils/self";
import {
  sanitizeFilePath,
  sanitizeFilePathAndGetAbstractFile,
} from "src/utils/file-handling";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "src/utils/plugins";

// The absence of a parameter `blah`, a `blah=false` and a value-less `blah=`
// should all be treated as `false`. My reign shall be merciful.
export const zodOptionalBoolean = z.preprocess(
  (param: unknown): boolean =>
    typeof param === "string" && param !== "false" && param !== "",
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
 * existing template. If it is, returns a `TFile` instance.
 */
export const zodExistingTemplaterPath = z.preprocess(
  lookupAbstractFileForTemplaterPath,
  z.instanceof(TFile, {
    message: "Template doesn't exist or Templater isn't enabled",
  }),
);

/**
 * A schema which tests the passed-in string to see if it's a valid path to an
 * existing template. If it is, returns a `TFile` instance.
 */
export const zodExistingTemplatesPath = z.preprocess(
  lookupAbstractFileForTemplatesPath,
  z.instanceof(TFile, {
    message: "Template doesn't exist or Templates isn't enabled",
  }),
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
 * the parameter is a string and the string corresponds to an existing file or
 * folder. Otherwise returns `null`.
 *
 * @param path Any incoming zod parameter
 */
function lookupAbstractFileForFilePath(path: any): TAbstractFile | null {
  return (typeof path === "string" && path.length > 0)
    ? sanitizeFilePathAndGetAbstractFile(path, false)
    : null;
}

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing file or
 * folder. Otherwise returns `null`.
 *
 * @param path Any incoming zod parameter
 */
function lookupAbstractFolderForPath(path: any): TAbstractFile | null {
  return (typeof path === "string" && path.length > 0)
    ? self().app.vault.getAbstractFileByPath(path as string)
    : null;
}

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing template
 * file. If the passed in path can't be found, the function will also check
 * Templater's template folder path for the file. Returns `null` when the search
 * came up empty.
 *
 * @param path Any incoming zod parameter
 * @returns
 */
function lookupAbstractFileForTemplaterPath(path: any): TAbstractFile | null {
  if (typeof path !== "string" || !path) {
    return null;
  }

  const abstractFile = sanitizeFilePathAndGetAbstractFile(path, true);
  if (abstractFile) return abstractFile;

  const res = getEnabledCommunityPlugin("templater-obsidian");
  if (res.isSuccess) {
    const folder = res.result.settings?.templates_folder;
    return sanitizeFilePathAndGetAbstractFile(`${folder}/${path}`, true) ||
      sanitizeFilePathAndGetAbstractFile(`${folder}/${path}.md`, true);
  }

  return null;
}

/**
 * Takes an incoming parameter and returns the corresponding `TAbstractFile` if
 * the parameter is a string and the string corresponds to an existing template
 * file. If the passed in path can't be found, the function will also check
 * Templates' template folder path for the file. Returns `null` when the search
 * came up empty.
 *
 * @param path Any incoming zod parameter
 * @returns
 */
function lookupAbstractFileForTemplatesPath(path: any): TAbstractFile | null {
  if (typeof path !== "string" || !path) {
    return null;
  }

  const abstractFile = sanitizeFilePathAndGetAbstractFile(path, true);
  if (abstractFile) return abstractFile;

  const res = getEnabledCorePlugin("templates");
  if (res.isSuccess) {
    const folder = res.result.options?.folder;
    return sanitizeFilePathAndGetAbstractFile(`${folder}/${path}`, true) ||
      sanitizeFilePathAndGetAbstractFile(`${folder}/${path}.md`, true);
  }

  return null;
}
