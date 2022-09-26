import { STRINGS } from "../constants";
import { RegexResult } from "../types";

const FRONT_MATTER_BOUNDARY = "---\n";

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

/**
 * Tests whether the passed-in string starts with front matter.
 *
 * @param noteContent - The content of the note to be searched
 *
 * @see {@link https://help.obsidian.md/Advanced+topics/YAML+front+matter | Obsidian's YAML front matter documentation}
 */
export function containsFrontMatter(noteContent: string) {
  return noteContent.startsWith(FRONT_MATTER_BOUNDARY) &&
    (noteContent.indexOf(FRONT_MATTER_BOUNDARY, 4) > -1);
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
  const bodyStartPos = noteContent.indexOf(FRONT_MATTER_BOUNDARY, 4) + 4;

  return containsFrontMatter(noteContent)
    ? {
      frontMatter: noteContent.slice(0, bodyStartPos),
      body: noteContent.slice(bodyStartPos),
    }
    : {
      frontMatter: "",
      body: noteContent,
    };
}
