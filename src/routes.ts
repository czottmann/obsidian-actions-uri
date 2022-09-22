import {
  handleDailyNoteAppend,
  handleDailyNoteCreate,
  handleDailyNoteGet,
  handleDailyNotePrepend,
  handleNoteAppend,
  handleNoteCreate,
  handleNoteGet,
  handleNotePrepend,
  handleOpenDailyNote,
  handleOpenNote,
  handleOpenSearch,
  handleRoot,
} from "./handlers";
import { Route } from "./types";
import {
  DailyNoteCreatePayload,
  DailyNoteReadPayload,
  DailyNoteWritePayload,
  IncomingBasePayload,
  NoteReadPayload,
  NoteWritePayload,
  OpenDailyNotePayload,
  OpenNotePayload,
  OpenSearchPayload,
} from "./schemata";

export const routes: Route[] = [
  {
    path: "",
    schema: IncomingBasePayload,
    handler: handleRoot,
  },
  // --------------------
  {
    path: ["daily-note", "daily-note/get"],
    schema: DailyNoteReadPayload,
    handler: handleDailyNoteGet,
  },
  {
    path: "daily-note/create",
    schema: DailyNoteCreatePayload,
    handler: handleDailyNoteCreate,
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
  // --------------------
  {
    path: ["note", "note/get"],
    schema: NoteReadPayload,
    handler: handleNoteGet,
  },
  {
    path: "note/create",
    schema: NoteWritePayload,
    handler: handleNoteCreate,
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
  // --------------------
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
