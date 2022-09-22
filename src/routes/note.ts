import { Vault } from "obsidian";
import { z } from "zod";
import { createNote, createOrOverwriteNote } from "../file-handling";
import {
  basePayload,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import { Route, ZodSafeParseSuccessData } from "../types";

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

const NoteSearchPayload = z.object({
  ...basePayload,
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

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
    schema: NoteSearchPayload,
    handler: handleNoteSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: NoteSearchPayload,
    handler: handleNoteSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

// TODO: Support für optional `silent` in allen Handlern implementieren
// TODO: Support for optionale Callbacks in allen Handlern implementieren

// TODO: handleNoteGet()
function handleNoteGet(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteReadPayload>;
  console.log("handleNoteGet", payload);
}

function handleNoteCreate(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteCreatePayload>;
  const { file, content, overwrite, silent } = payload;

  if (overwrite) {
    createOrOverwriteNote(file, content || "", vault);
  } else {
    createNote(file, content || "", vault);
  }
}

// TODO: handleNoteAppend()
function handleNoteAppend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

// TODO: handleNotePrepend()
function handleNotePrepend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

// TODO: handleNoteSearchStringAndReplace()
function handleNoteSearchStringAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteSearchPayload>;
  console.log("handleNoteSearchStringAndReplace", payload);
}

// TODO: handleNoteSearchRegexAndReplace()
function handleNoteSearchRegexAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
) {
  const payload = data as z.infer<typeof NoteSearchPayload>;
  console.log("handleNoteSearchRegexAndReplace", payload);
}
