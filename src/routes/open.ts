import { z } from "zod";
import { basePayload } from "../schemata";
import {
  AnyResult,
  Route,
  SuccessfulStringResult,
  UnsuccessfulResult,
  ZodSafeParseSuccessData,
} from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const OpenDailyNotePayload = z.object(basePayload);
const OpenNotePayload = z.object(basePayload);
const OpenSearchPayload = z.object({
  ...basePayload,
  query: z.string().min(1, { message: "can't be empty" }),
});

export type PayloadUnion =
  | z.infer<typeof OpenDailyNotePayload>
  | z.infer<typeof OpenNotePayload>
  | z.infer<typeof OpenSearchPayload>;

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: "open/daily-note",
    schema: OpenDailyNotePayload,
    handler: handleOpenDailyNote,
  },
  { path: "open/note", schema: OpenNotePayload, handler: handleOpenNote },
  { path: "open/search", schema: OpenSearchPayload, handler: handleOpenSearch },
];

// HANDLERS --------------------

// TODO: handleOpenDailyNote()
async function handleOpenDailyNote(
  data: ZodSafeParseSuccessData,
): Promise<AnyResult> {
  const payload = data as z.infer<typeof OpenDailyNotePayload>;
  console.log("handleOpenDailyNote", payload);
  return <SuccessfulStringResult> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleOpenNote()
async function handleOpenNote(
  data: ZodSafeParseSuccessData,
): Promise<AnyResult> {
  const payload = data as z.infer<typeof OpenNotePayload>;
  console.log("handleOpenNote", payload);
  return <SuccessfulStringResult> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleOpenSearch()
async function handleOpenSearch(
  data: ZodSafeParseSuccessData,
): Promise<AnyResult> {
  const payload = data as z.infer<typeof OpenSearchPayload>;
  console.log("handleOpenSearch", payload);
  return <SuccessfulStringResult> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
