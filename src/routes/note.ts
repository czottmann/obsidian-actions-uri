import { Vault } from "obsidian";
import { z } from "zod";
import {
  createNote,
  createOrOverwriteNote,
  getNoteContent,
} from "../file-handling";
import {
  basePayload,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParseSuccessData,
} from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const NoteCreatePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const NoteReadPayload = z.object({
  ...basePayload,
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const NoteWritePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

const NotePrependPayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

const NoteSearchAndReplacePayload = z.object({
  ...basePayload,
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

export type PayloadUnion =
  | z.infer<typeof NoteCreatePayload>
  | z.infer<typeof NoteReadPayload>
  | z.infer<typeof NoteWritePayload>
  | z.infer<typeof NotePrependPayload>
  | z.infer<typeof NoteSearchAndReplacePayload>;

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: ["note", "note/get"],
    schema: NoteReadPayload,
    handler: handleNoteGet,
  },
  {
    path: "note/create",
    schema: NoteCreatePayload,
    handler: handleNoteCreate,
  },
  {
    path: "note/append",
    schema: NoteWritePayload,
    handler: handleNoteAppend,
  },
  {
    path: "note/prepend",
    schema: NotePrependPayload,
    handler: handleNotePrepend,
  },
  {
    path: "note/search-string-and-replace",
    schema: NoteSearchAndReplacePayload,
    handler: handleNoteSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: NoteSearchAndReplacePayload,
    handler: handleNoteSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleNoteGet(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NoteReadPayload>;
  const { file } = payload;
  const content = await getNoteContent(file, vault);

  return content
    ? <HandlerFileSuccess> {
      success: true,
      data: { file, content },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: "Note not found",
      input: payload,
    };
}

async function handleNoteCreate(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NoteCreatePayload>;
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
      error: "Note couldn't be written",
      input: payload,
    };
}

// TODO: handleNoteAppend()
async function handleNoteAppend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NoteWritePayload>;
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
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNoteSearchStringAndReplace()
async function handleNoteSearchStringAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NoteSearchAndReplacePayload>;
  console.log("handleNoteSearchStringAndReplace", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNoteSearchRegexAndReplace()
async function handleNoteSearchRegexAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NoteSearchAndReplacePayload>;
  console.log("handleNoteSearchRegexAndReplace", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
