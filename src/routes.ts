import { AnyZodObject, z } from "zod";
import {
  handleDailyNoteAppend,
  handleDailyNoteCreate,
  handleDailyNoteCreateOrOverwrite,
  handleDailyNoteOpen,
  handleDailyNotePrepend,
  handleDailyNoteRead,
  handleNoteAppend,
  handleNoteCreate,
  handleNoteCreateOrOverwrite,
  handleNoteOpen,
  handleNotePrepend,
  handleNoteRead,
  handleRoot,
} from "./handlers";
import {
  DailyNoteOpenPayload,
  DailyNoteReadPayload,
  DailyNoteWritePayload,
  IncomingBasePayload,
  NoteOpenPayload,
  NoteReadPayload,
  NoteWritePayload,
} from "./validators";

export type Route = {
  path: string;
  schema: AnyZodObject;
  handler: <T extends typeof IncomingBasePayload>(
    payload: z.infer<T>,
  ) => void;
};

export const routes: Route[] = [
  {
    path: "",
    schema: IncomingBasePayload,
    handler: handleRoot,
  },
  {
    path: "daily-note",
    schema: DailyNoteReadPayload,
    handler: handleDailyNoteRead,
  },
  {
    path: "daily-note/open",
    schema: DailyNoteOpenPayload,
    handler: handleDailyNoteOpen,
  },
  {
    path: "daily-note/create",
    schema: DailyNoteWritePayload,
    handler: handleDailyNoteCreate,
  },
  {
    path: "daily-note/create-or-overwrite",
    schema: DailyNoteWritePayload,
    handler: handleDailyNoteCreateOrOverwrite,
  },
  {
    path: "daily-note/append",
    schema: DailyNoteWritePayload,
    handler: handleDailyNoteAppend,
  },
  {
    path: "daily-note/prepend",
    schema: DailyNoteWritePayload,
    handler: handleDailyNotePrepend,
  },
  {
    path: "note",
    schema: NoteReadPayload,
    handler: handleNoteRead,
  },
  {
    path: "note/open",
    schema: NoteOpenPayload,
    handler: handleNoteOpen,
  },
  {
    path: "note/create",
    schema: NoteWritePayload,
    handler: handleNoteCreate,
  },
  {
    path: "note/create-or-overwrite",
    schema: NoteWritePayload,
    handler: handleNoteCreateOrOverwrite,
  },
  {
    path: "note/append",
    schema: NoteWritePayload,
    handler: handleNoteAppend,
  },
  {
    path: "note/prepend",
    schema: NoteWritePayload,
    handler: handleNotePrepend,
  },
];
