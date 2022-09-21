import { z, ZodError } from "zod";
import { showBrandedNotice } from "./utils";
import {
  DailyNoteOpenPayload,
  DailyNoteReadPayload,
  DailyNoteWritePayload,
  NoteOpenPayload,
  NoteReadPayload,
  NoteWritePayload,
} from "./validators";

export function handleParseError(parseError: ZodError) {
  const msg = [
    "Incoming call failed",
    parseError.errors
      .map((error) => `- ${error.path.join(".")}: ${error.message}`),
  ].flat().join("\n");

  console.error(msg);
  showBrandedNotice(msg);
}

export function handleRoot(payload: {}) {
  showBrandedNotice("… is ready for action 🚀");
}

export function handleDailyNoteRead(
  payload: z.infer<typeof DailyNoteReadPayload>,
) {
  console.log("handleDailyNoteRead");
  console.dir(payload);
}

export function handleDailyNoteOpen(
  payload: z.infer<typeof DailyNoteOpenPayload>,
) {
  console.log("handleDailyNoteOpen");
  console.dir(payload);
}

export function handleDailyNoteCreate(
  payload: z.infer<typeof DailyNoteWritePayload>,
) {
  console.log("handleDailyNoteCreate");
  console.dir(payload);
}

export function handleDailyNoteCreateOrOverwrite(
  payload: z.infer<typeof DailyNoteWritePayload>,
) {
  console.log("handleDailyNoteCreateOrOverwrite");
  console.dir(payload);
}

export function handleDailyNoteAppend(
  payload: z.infer<typeof DailyNoteWritePayload>,
) {
  console.log("handleDailyNotePrepend");
  console.dir(payload);
}

export function handleDailyNotePrepend(
  payload: z.infer<typeof DailyNoteWritePayload>,
) {
  console.log("handleDailyNotePrepend");
  console.dir(payload);
}

export function handleNoteRead(
  payload: z.infer<typeof NoteReadPayload>,
) {
  console.log("handleNoteRead");
  console.dir(payload);
}

export function handleNoteOpen(
  payload: z.infer<typeof NoteOpenPayload>,
) {
  console.log("handleNoteOpen");
  console.dir(payload);
}

export function handleNoteCreate(
  payload: z.infer<typeof NoteWritePayload>,
) {
  console.log("handleNoteCreate");
  console.dir(payload);
}

export function handleNoteCreateOrOverwrite(
  payload: z.infer<typeof NoteWritePayload>,
) {
  console.log("handleNoteCreateOrOverwrite");
  console.dir(payload);
}

export function handleNoteAppend(
  payload: z.infer<typeof NoteWritePayload>,
) {
  console.log("handleNotePrepend");
  console.dir(payload);
}

export function handleNotePrepend(
  payload: z.infer<typeof NoteWritePayload>,
) {
  console.log("handleNotePrepend");
  console.dir(payload);
}
