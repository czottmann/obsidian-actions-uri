import { z } from "zod";
import { basePayload } from "../schemata";
import { Route, ZodSafeParseSuccessData } from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const OpenDailyNotePayload = z.object(basePayload);
const OpenNotePayload = z.object(basePayload);
const OpenSearchPayload = z.object({
  ...basePayload,
  query: z.string(),
});

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: "open/daily-note",
    schema: OpenDailyNotePayload,
    handler: handleOpenDailyNote,
  },
  {
    path: "open/note",
    schema: OpenNotePayload,
    handler: handleOpenNote,
  },
  {
    path: "open/search",
    schema: OpenSearchPayload,
    handler: handleOpenSearch,
  },
];

// HANDLERS --------------------

function handleOpenDailyNote(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenDailyNotePayload>;
  console.log("handleOpenDailyNote", payload);
}

function handleOpenNote(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenNotePayload>;
  console.log("handleOpenNote", payload);
}

function handleOpenSearch(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenSearchPayload>;
  console.log("handleOpenSearch", payload);
}
