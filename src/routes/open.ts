import { z } from "zod";
import { incomingBaseParams } from "../schemata";
import { AnyParams, Route } from "../routes";
import { AnyHandlerResult, HandlerFailure, HandlerTextSuccess } from "../types";
import { getDailyNotePathIfPluginIsAvailable } from "../utils/file-handling";
import { helloRoute, namespaceRoutes } from "../utils/routing";

// SCHEMATA --------------------

const dailyNoteParams = incomingBaseParams.extend({});
const noteParams = incomingBaseParams.extend({});
const searchParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
});

export type AnyLocalParams =
  | z.infer<typeof dailyNoteParams>
  | z.infer<typeof noteParams>
  | z.infer<typeof searchParams>;

// ROUTES --------------------

export const routes: Route[] = namespaceRoutes("open", [
  helloRoute(),
  {
    path: "daily-note",
    schema: dailyNoteParams,
    handler: handleDailyNote,
  },
  { path: "note", schema: noteParams, handler: handleNote },
  { path: "search", schema: searchParams, handler: handleSearch },
]);

// HANDLERS --------------------

// TODO: handleDailyNote()
async function handleDailyNote(
  data: AnyParams,
): Promise<AnyHandlerResult> {
  const res = getDailyNotePathIfPluginIsAvailable();
  if (!res.isSuccess) {
    return <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
  }

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
  data: AnyParams,
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
  data: AnyParams,
): Promise<AnyHandlerResult> {
  const params = data as z.infer<typeof searchParams>;
  console.log("handleSearch", params);
  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: params,
  };
}
