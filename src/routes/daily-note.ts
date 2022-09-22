import { z } from "zod";
import { basePayload, zodOptionalBoolean } from "../schemata";
import { Route, ZodSafeParseSuccessData } from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const DailyNoteCreatePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const DailyNoteReadPayload = z.object({
  ...basePayload,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const DailyNoteWritePayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});

const DailyNotePrependPayload = z.object({
  ...basePayload,
  content: z.string().optional(),
  silent: zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: ["daily-note", "daily-note/get"],
    schema: DailyNoteReadPayload,
    handler: handleDailyNoteGet,
  },
  {
    path: "daily-note/create",
    schema: DailyNoteCreatePayload,
    handler: handleDailyNoteCreate,
  },
  {
    path: "daily-note/append",
    schema: DailyNoteWritePayload,
    handler: handleDailyNoteAppend,
  },
  {
    path: "daily-note/prepend",
    schema: DailyNotePrependPayload,
    handler: handleDailyNotePrepend,
  },
];

// HANDLERS --------------------

// TODO: handleDailyNoteGet()
function handleDailyNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteReadPayload>;
  console.log("handleDailyNoteGet", payload);
}

// TODO: handleDailyNoteCreate()
function handleDailyNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteCreatePayload>;
  console.log("handleDailyNoteCreate", payload);
}

// TODO: handleDailyNoteAppend()
function handleDailyNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}

// TODO: handleDailyNotePrepend()
function handleDailyNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}
