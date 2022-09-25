import { z } from "zod";
import { incomingBaseParams } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------

const dailyNoteParams = incomingBaseParams.extend({});
const noteParams = incomingBaseParams.extend({});
const searchParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});

export type ParamsUnion =
  | z.infer<typeof dailyNoteParams>
  | z.infer<typeof noteParams>
  | z.infer<typeof searchParams>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("open"),
  {
    path: "open/daily-note",
    schema: dailyNoteParams,
    handler: handleDailyNote,
  },
  { path: "open/note", schema: noteParams, handler: handleNote },
  { path: "open/search", schema: searchParams, handler: handleSearch },
];

// HANDLERS --------------------

// TODO: handleDailyNote()
async function handleDailyNote(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const params = data as z.infer<typeof dailyNoteParams>;
  console.log("handleDailyNote", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}

// TODO: handleNote()
async function handleNote(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const params = data as z.infer<typeof noteParams>;
  console.log("handleNote", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}

// TODO: handleSearch()
async function handleSearch(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const params = data as z.infer<typeof searchParams>;
  console.log("handleSearch", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}
