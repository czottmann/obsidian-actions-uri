import { Route } from "./types";
import {
  PayloadUnion as DailyNotePayloadUnion,
  routes as dailyNoteRoutes,
} from "./routes/daily-note";
import {
  PayloadUnion as NotePayloadUnion,
  routes as noteRoutes,
} from "./routes/note";
import {
  PayloadUnion as OpenPayloadUnion,
  routes as openRoutes,
} from "./routes/open";
import {
  PayloadUnion as RootPayloadUnion,
  routes as rootRoutes,
} from "./routes/root";
import {
  PayloadUnion as SearchPayloadUnion,
  routes as searchRoutes,
} from "./routes/search";

export type PayloadUnion =
  | DailyNotePayloadUnion
  | NotePayloadUnion
  | OpenPayloadUnion
  | RootPayloadUnion
  | SearchPayloadUnion;

export const routes: Route[] = [
  ...rootRoutes,
  ...dailyNoteRoutes,
  ...noteRoutes,
  ...openRoutes,
  ...searchRoutes,
];
