import { z } from "zod";
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
import { routes as rootRoutes } from "./routes/root";
import {
  PayloadUnion as SearchPayloadUnion,
  routes as searchRoutes,
} from "./routes/search";
import { basePayload } from "./schemata";
import { Route } from "./types";

export type PayloadUnion =
  | z.infer<typeof basePayload>
  | DailyNotePayloadUnion
  | NotePayloadUnion
  | OpenPayloadUnion
  | SearchPayloadUnion;

export const routes: Route[] = [
  ...rootRoutes,
  ...dailyNoteRoutes,
  ...noteRoutes,
  ...openRoutes,
  ...searchRoutes,
];
