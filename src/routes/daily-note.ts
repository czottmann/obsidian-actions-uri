import { z } from "zod";
import { incomingBaseParams, zodOptionalBoolean } from "../schemata";
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

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const readParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const writeParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
});

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});

const prependParams = incomingBaseParams.extend({
  content: z.string().optional(),
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

export type ParamsUnion =
  | z.infer<typeof createParams>
  | z.infer<typeof readParams>
  | z.infer<typeof writeParams>
  | z.infer<typeof appendParams>
  | z.infer<typeof prependParams>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("daily-note"),
  {
    path: "daily-note/get-current",
    schema: readParams,
    handler: handleGetCurrent,
  },
  {
    path: "daily-note/get-most-recent",
    schema: readParams,
    handler: handleGetMostRecent,
  },
  { path: "daily-note/create", schema: createParams, handler: handleCreate },
  { path: "daily-note/append", schema: appendParams, handler: handleAppend },
  { path: "daily-note/prepend", schema: prependParams, handler: handlePrepend },
];

// HANDLERS --------------------

// console.log(
//   appHasDailyNotesPluginLoaded(),
//   getDailyNote(window.moment(), getAllDailyNotes()),
//   // createDailyNote(window.moment()),
// );

// TODO: handleGetCurrent()
async function handleGetCurrent(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof readParams>;
  console.log("handleGetCurrent", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleGetMostRecent()
async function handleGetMostRecent(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof readParams>;
  console.log("handleGetMostRecent", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleCreate()
async function handleCreate(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof createParams>;
  console.log("handleCreate", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handleAppend()
async function handleAppend(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof writeParams>;
  console.log("handlePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}

// TODO: handlePrepend()
async function handlePrepend(
  incomingParams: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = incomingParams as z.infer<typeof writeParams>;
  console.log("handlePrepend", payload);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: payload,
  };
}
