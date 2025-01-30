import { getFrontMatterInfo } from "obsidian";
import { STRINGS } from "src/constants";
import { RegexResultObject } from "src/types";
import { ErrorCode, failure, success } from "src/utils/results-handling";

const FRONT_MATTER_BOUNDARY = "---\n";

/**
 * Makes sure the passed-in string ends in a newline.
 *
 * @param str - The string that should end in a newline
 * @returns String ending in a newline
 */
export function endStringWithNewline(str: string = ""): string {
  return str.endsWith("\n") ? str : `${str}\n`;
}

/**
 * Tries to parse a regular expression stored as a string into an actual, real
 * `RegExp` object.
 *
 * @param search - A string containing a full regular expression, e.g. "/^herp/i"
 *
 * @returns A `RegexResultObject` object containing either an `error` string or
 * a `RegExp` object
 */
export function parseStringIntoRegex(search: string): RegexResultObject {
  if (!search.startsWith("/")) {
    return failure(ErrorCode.InvalidInput, STRINGS.search_pattern_invalid);
  }

  // Starts to look like a regex, let's try to parse it.
  let re = search.slice(1);
  const lastSlashIdx = re.lastIndexOf("/");

  if (lastSlashIdx === 0) {
    return failure(ErrorCode.InvalidInput, STRINGS.search_pattern_empty);
  }

  let searchPattern: RegExp;
  let flags = re.slice(lastSlashIdx + 1);
  re = re.slice(0, lastSlashIdx);

  try {
    searchPattern = new RegExp(re, flags);
  } catch (e) {
    return failure(ErrorCode.InvalidInput, STRINGS.search_pattern_unparseable);
  }

  return success(searchPattern);
}

/**
 * Escapes special characters in a string that are used in regular expressions.
 * This function is useful when a string is to be treated as a literal pattern
 * inside a regular expression, rather than as part of the regular expression
 * syntax.
 *
 * @param string - The string to be escaped.
 * @returns The escaped string, with special regular expression characters prefixed
 * with a backslash. This makes the string safe to use within a RegExp constructor
 * or function.
 */
export function escapeRegExpChars(string: string) {
  return string.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
}

/**
 * Extracts front matter and body from a passed-in string.
 *
 * @param noteContent - The content of the note to be searched
 *
 * @returns An object containing both `frontMatter` and `body` of the note as
 * keys. When no front matter was found, `frontMatter` will be an empty string
 * while `note` will contain the input string
 *
 * @see {@link https://help.obsidian.md/Advanced+topics/YAML+front+matter | Obsidian's YAML front matter documentation}
 */
export function extractNoteContentParts(
  noteContent: string,
): { frontMatter: string; body: string } {
  const info = getFrontMatterInfo(noteContent);

  return {
    frontMatter: info.frontmatter,
    body: noteContent.slice(info.contentStart),
  };
}

/**
 * Returns the kebab-cased version of a passed-in string.
 *
 * @param text - The text to be turned kebab-case
 *
 * @returns Text in kebab-case
 *
 * @example "hello you veryNice" -> "hello-you-very-nice"
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
