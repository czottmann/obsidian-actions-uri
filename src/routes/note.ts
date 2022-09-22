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
];

// HANDLERS --------------------

function handleNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteReadPayload>;
  console.log("handleNoteGet", payload);
}

function handleNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteCreatePayload>;
  console.log("handleNoteCreate", payload);
}

function handleNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

function handleNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}
