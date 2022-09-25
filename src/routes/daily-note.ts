import { z } from "zod";
import { basePayloadSchema, zodOptionalBoolean } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const CreatePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const ReadPayload = z.object({
  ...basePayloadSchema,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const WritePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  silent: zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

export type PayloadUnion =
  | z.infer<typeof CreatePayload>
  | z.infer<typeof ReadPayload>
  | z.infer<typeof WritePayload>
  | z.infer<typeof PrependPayload>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("daily-note"),
  {
    path: "daily-note/get-current",
    schema: ReadPayload,
    handler: handleDailyNoteGetCurrent,
  },
  {
    path: "daily-note/get-most-recent",
    schema: ReadPayload,
    handler: handleDailyNoteGetMostRecent,
  },
  {
    path: "daily-note/create",
    schema: CreatePayload,
    handler: handleDailyNoteCreate,
  },
  {
    path: "daily-note/append",
    schema: WritePayload,
    handler: handleDailyNoteAppend,
  },
  {
    path: "daily-note/prepend",
    schema: PrependPayload,
    handler: handleDailyNotePrepend,
  },
];

// HANDLERS --------------------

// console.log(
//   appHasDailyNotesPluginLoaded(),
//   getDailyNote(window.moment(), getAllDailyNotes()),
//   // createDailyNote(window.moment()),
// );

// TODO: handleDailyNoteGetCurrent()
async function handleDailyNoteGetCurrent(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof ReadPayload>;
  console.log("handleDailyNoteGetCurrent", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleDailyNoteGetMostRecent()
async function handleDailyNoteGetMostRecent(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof ReadPayload>;
  console.log("handleDailyNoteGetMostRecent", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleDailyNoteCreate()
async function handleDailyNoteCreate(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof CreatePayload>;
  console.log("handleDailyNoteCreate", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleDailyNoteAppend()
async function handleDailyNoteAppend(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof WritePayload>;
  console.log("handleDailyNotePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleDailyNotePrepend()
async function handleDailyNotePrepend(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof WritePayload>;
  console.log("handleDailyNotePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}
