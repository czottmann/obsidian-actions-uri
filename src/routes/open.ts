import { z } from "zod";
import { basePayloadSchema } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const DailyNotePayload = z.object(basePayloadSchema);
const NotePayload = z.object(basePayloadSchema);
const SearchPayload = z.object({
  ...basePayloadSchema,
  query: z.string().min(1, { message: "can't be empty" }),
});

export type PayloadUnion =
  | z.infer<typeof DailyNotePayload>
  | z.infer<typeof NotePayload>
  | z.infer<typeof SearchPayload>;

// ROUTES --------------------

export const routes: Route[] = [
  helloRoute("open"),
  {
    path: "open/daily-note",
    schema: DailyNotePayload,
    handler: handleOpenDailyNote,
  },
  { path: "open/note", schema: NotePayload, handler: handleOpenNote },
  { path: "open/search", schema: SearchPayload, handler: handleOpenSearch },
];

// HANDLERS --------------------

// TODO: handleOpenDailyNote()
async function handleOpenDailyNote(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof DailyNotePayload>;
  console.log("handleOpenDailyNote", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleOpenNote()
async function handleOpenNote(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof NotePayload>;
  console.log("handleOpenNote", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleOpenSearch()
async function handleOpenSearch(
  data: ZodSafeParsedData,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchPayload>;
  console.log("handleOpenSearch", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
