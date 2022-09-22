import { z } from "zod";
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
    schema: NoteWritePayload,
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

// TODO: handleNoteGet()
function handleNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteReadPayload>;
  console.log("handleNoteGet", payload);
}

// TODO: handleNoteCreate()
function handleNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteCreatePayload>;
  console.log("handleNoteCreate", payload);
}

// TODO: handleNoteAppend()
function handleNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

// TODO: handleNotePrepend()
function handleNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

// TODO: handleNoteSearchStringAndReplace()
function handleNoteSearchStringAndReplace(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteSearchPayload>;
  console.log("handleNoteSearchStringAndReplace", payload);
}

// TODO: handleNoteSearchRegexAndReplace()
function handleNoteSearchRegexAndReplace(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteSearchPayload>;
  console.log("handleNoteSearchRegexAndReplace", payload);
}
