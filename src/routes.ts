import {
  ParamsUnion as DailyNoteParamsUnion,
  routes as dailyNoteRoutes,
} from "./routes/daily-note";
import {
  ParamsUnion as NoteParamsUnion,
  routes as noteRoutes,
} from "./routes/note";
import {
  ParamsUnion as OpenParamsUnion,
  routes as openRoutes,
} from "./routes/open";
import { routes as rootRoutes } from "./routes/root";
import {
  ParamsUnion as SearchParamsUnion,
  routes as searchRoutes,
} from "./routes/search";
import { IncomingBaseParams } from "./schemata";
import { Route } from "./types";

export type ParamsUnion =
  | IncomingBaseParams
  | DailyNoteParamsUnion
  | NoteParamsUnion
  | OpenParamsUnion
  | SearchParamsUnion;

export const routes: Route[] = [
  ...rootRoutes,
  ...dailyNoteRoutes,
  ...noteRoutes,
  ...openRoutes,
  ...searchRoutes,
];
