import { z } from "zod";
import { basePayload, zodOptionalBoolean } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParseSuccessData,
} from "../types";

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

export type PayloadUnion =
  | z.infer<typeof DailyNoteCreatePayload>
  | z.infer<typeof DailyNoteReadPayload>
  | z.infer<typeof DailyNoteWritePayload>
  | z.infer<typeof DailyNotePrependPayload>;

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

// console.log(
//   appHasDailyNotesPluginLoaded(),
//   getDailyNote(window.moment(), getAllDailyNotes()),
//   // createDailyNote(window.moment()),
// );

// TODO: handleDailyNoteGet()
async function handleDailyNoteGet(
  data: ZodSafeParseSuccessData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof DailyNoteReadPayload>;
  console.log("handleDailyNoteGet", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleDailyNoteCreate()
async function handleDailyNoteCreate(
  data: ZodSafeParseSuccessData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof DailyNoteCreatePayload>;
  console.log("handleDailyNoteCreate", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleDailyNoteAppend()
async function handleDailyNoteAppend(
  data: ZodSafeParseSuccessData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleDailyNotePrepend()
async function handleDailyNotePrepend(
  data: ZodSafeParseSuccessData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
