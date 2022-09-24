import { Vault } from "obsidian";
import { z } from "zod";
import {
  createNote,
  createOrOverwriteNote,
  getNoteContent,
} from "../utils/file-handling";
import {
  basePayloadSchema,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import { helloRoute } from "../utils/routing";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Result,
  Route,
  ZodSafeParseSuccessData,
} from "../types";

const RESULT_STRINGS = {
  note_not_found: "Note couldn't be found",
  replacement_done: "Replacement done",
  search_pattern_empty: "Search pattern is empty",
  search_pattern_invalid: "Search pattern must start with a forward slash",
  search_pattern_not_found: "Search pattern wasn't found, nothing replaced",
  search_pattern_unparseable: "Search pattern is not correctly formed",
  search_string_not_found: "Search string wasn't found, nothing replaced",
  unable_to_write_note: "Can't write note file",
};

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const CreatePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const ReadPayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const WritePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

const SearchAndReplacePayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

export type PayloadUnion =
  | z.infer<typeof CreatePayload>
  | z.infer<typeof ReadPayload>
  | z.infer<typeof WritePayload>
  | z.infer<typeof PrependPayload>
  | z.infer<typeof SearchAndReplacePayload>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("note"),
  { path: "note/get", schema: ReadPayload, handler: handleNoteGet },
  { path: "note/create", schema: CreatePayload, handler: handleNoteCreate },
  { path: "note/append", schema: WritePayload, handler: handleNoteAppend },
  { path: "note/prepend", schema: PrependPayload, handler: handleNotePrepend },
  {
    path: "note/search-string-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleNoteGet(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof ReadPayload>;
  const { file } = payload;
  const content = await getNoteContent(file, vault);

  return (typeof content !== "undefined")
    ? <HandlerFileSuccess> {
      success: true,
      data: { file, content },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: RESULT_STRINGS.note_not_found,
      input: payload,
    };
}

async function handleNoteCreate(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof CreatePayload>;
  const { file, content, overwrite } = payload;

  const result = overwrite
    ? await createOrOverwriteNote(file, content || "", vault)
    : await createNote(file, content || "", vault);

  return result
    ? <HandlerTextSuccess> {
      success: true,
      data: { result: file },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: RESULT_STRINGS.unable_to_write_note,
      input: payload,
    };
}

// TODO: handleNoteAppend()
async function handleNoteAppend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNotePrepend()
async function handleNotePrepend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

async function handleNoteSearchStringAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { search } = payload;
  return await searchAndReplaceInNote(data, new RegExp(search, "g"), vault);
}

async function handleNoteSearchRegexAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { search } = payload;
  const res = parseStringIntoRegex(search);

  return res.success
    ? await searchAndReplaceInNote(data, res.result, vault)
    : <HandlerFailure> {
      success: false,
      error: res.error,
      input: payload,
    };
}

// HELPERS --------------------

async function searchAndReplaceInNote(
  data: ZodSafeParseSuccessData,
  search: string | RegExp,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  const { file, replace } = payload;
  const content = await getNoteContent(file, vault);

  if (typeof content === "undefined") {
    return <HandlerFailure> {
      success: false,
      error: RESULT_STRINGS.note_not_found,
      input: payload,
    };
  }

  const newContent = content.replace(search, replace);
  if (content === newContent) {
    return <HandlerTextSuccess> {
      success: true,
      data: {
        result: typeof search === "string"
          ? RESULT_STRINGS.search_string_not_found
          : RESULT_STRINGS.search_pattern_not_found,
      },
      input: payload,
    };
  } else {
    const updatedFile = await createOrOverwriteNote(file, newContent, vault);

    return (typeof updatedFile === "undefined")
      ? <HandlerTextSuccess> {
        success: true,
        data: { result: RESULT_STRINGS.replacement_done },
        input: payload,
      }
      : <HandlerFailure> {
        success: false,
        error: RESULT_STRINGS.unable_to_write_note,
        input: payload,
      };
  }
}

function parseStringIntoRegex(search: string): Result {
  let searchPattern: RegExp;

  if (!search.startsWith("/")) {
    return <Result> {
      success: false,
      error: RESULT_STRINGS.search_pattern_invalid,
    };
  }

  // Starts to look like a regex, let's try to parse it.
  let re = search.slice(1);
  const lastSlashIdx = re.lastIndexOf("/");

  if (lastSlashIdx === 0) {
    return <Result> {
      success: false,
      error: RESULT_STRINGS.search_pattern_empty,
    };
  }

  let flags = re.slice(lastSlashIdx + 1);
  re = re.slice(0, lastSlashIdx);

  try {
    searchPattern = new RegExp(re, flags);
  } catch (e) {
    return <Result> {
      success: false,
      error: RESULT_STRINGS.search_pattern_unparseable,
    };
  }

  return <Result> {
    success: true,
    result: searchPattern,
  };
}
