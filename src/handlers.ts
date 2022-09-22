import { z, ZodError } from "zod";
import {
  DailyNoteReadPayload,
  DailyNoteWritePayload,
  NoteReadPayload,
  NoteWritePayload,
  OpenDailyNotePayload,
  OpenNotePayload,
  OpenSearchPayload,
} from "./schemata";
import { ZodSafeParseSuccessData } from "./types";
import { showBrandedNotice } from "./utils";

export function handleParseError(parseError: ZodError) {
  const msg = [
    "Incoming call failed",
    parseError.errors
      .map((error) => `- ${error.path.join(".")}: ${error.message}`),
  ].flat().join("\n");

  console.error(msg);
  showBrandedNotice(msg);
}

export function handleRoot(_: {}) {
  showBrandedNotice("… is ready for action 🚀");
}

// --------------------

export function handleDailyNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteReadPayload>;
  console.log("handleDailyNoteGet", payload);
}

export function handleDailyNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNoteCreate", payload);
}

export function handleDailyNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}

export function handleDailyNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof DailyNoteWritePayload>;
  console.log("handleDailyNotePrepend", payload);
}

// --------------------

export function handleNoteGet(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteReadPayload>;
  console.log("handleNoteGet", payload);
}

export function handleNoteCreate(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNoteCreate", payload);
}

export function handleNoteAppend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

export function handleNotePrepend(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof NoteWritePayload>;
  console.log("handleNotePrepend", payload);
}

// --------------------

export function handleOpenDailyNote(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenDailyNotePayload>;
  console.log("handleOpenDailyNote", payload);
}

export function handleOpenNote(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenNotePayload>;
  console.log("handleOpenNote", payload);
}

export function handleOpenSearch(data: ZodSafeParseSuccessData) {
  const payload = data as z.infer<typeof OpenSearchPayload>;
  console.log("handleOpenSearch", payload);
}
