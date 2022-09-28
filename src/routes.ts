import { AnyZodObject } from "zod";
import { HandlerFunction } from "./types";

import {
  AnyLocalParams as AnyDailyNoteParams,
  routes as dailyNoteRoutes,
} from "./routes/daily-note";
import {
  AnyLocalParams as AnyNoteParams,
  routes as noteRoutes,
} from "./routes/note";
import {
  AnyLocalParams as AnyOpenParams,
  routes as openRoutes,
} from "./routes/open";
import { routes as rootRoutes } from "./routes/root";
import {
  AnyLocalParams as AnySearchParams,
  routes as searchRoutes,
} from "./routes/search";
import {
  AnyLocalParams as AnyInfoParams,
  routes as infoRoutes,
} from "./routes/info";
import { IncomingBaseParams } from "./schemata";

export const routes: Route[] = [
  ...rootRoutes,
  ...dailyNoteRoutes,
  ...noteRoutes,
  ...openRoutes,
  ...searchRoutes,
  ...infoRoutes,
];

/**
 * A `Route` defines which handler function is responsible for which route path,
 * and what data structure the function can expect.
 */
export type Route = {
  path: string;
  schema: AnyZodObject;
  handler: HandlerFunction;
};

export type AnyParams =
  | IncomingBaseParams
  | AnyDailyNoteParams
  | AnyNoteParams
  | AnyOpenParams
  | AnySearchParams
  | AnyInfoParams;
