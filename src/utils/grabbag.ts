import { Notice } from "obsidian";
import { STRINGS } from "../constants";
import { RegexResult } from "../types";

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
 * Makes sure the passed-in string ends in a newline.
 *
 * @param str - The string that should end in a newline
 * @returns String ending in a newline
 */
export function ensureNewline(str: string = ""): string {
  return str.endsWith("\n") ? str : `${str}\n`;
}

export function parseStringIntoRegex(search: string): RegexResult {
  let searchPattern: RegExp;

  if (!search.startsWith("/")) {
    return <RegexResult> {
      isSuccess: false,
      error: STRINGS.search_pattern_invalid,
    };
  }

  // Starts to look like a regex, let's try to parse it.
  let re = search.slice(1);
  const lastSlashIdx = re.lastIndexOf("/");

  if (lastSlashIdx === 0) {
    return <RegexResult> {
      isSuccess: false,
      error: STRINGS.search_pattern_empty,
    };
  }

  let flags = re.slice(lastSlashIdx + 1);
  re = re.slice(0, lastSlashIdx);

  try {
    searchPattern = new RegExp(re, flags);
  } catch (e) {
    return <RegexResult> {
      isSuccess: false,
      error: STRINGS.search_pattern_unparseable,
    };
  }

  return <RegexResult> {
    isSuccess: true,
    result: searchPattern,
  };
}
