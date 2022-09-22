import { z } from "zod";
import { basePayload, zodOptionalBoolean } from "./schemata";
import { Route, ZodSafeParseSuccessData } from "./types";

// SCHEMATA --------------------

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
    schema: DailyNoteWritePayload,
    handler: handleDailyNotePrepend,
  },
];

// HANDLERS --------------------

function handleDailyNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteReadPayload>;
  console.log("handleDailyNoteGet", payload);
}

function handleDailyNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteCreatePayload>;
  console.log("handleDailyNoteCreate", payload);
}

function handleDailyNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}

function handleDailyNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}
