import { Route } from "./types";
import { routes as dailyNoteRoutes } from "./routes/daily-note";
import { routes as noteRoutes } from "./routes/note";
import { routes as openRoutes } from "./routes/open";
import { routes as rootRoutes } from "./routes/root";
import { routes as searchRoutes } from "./routes/search";

export const routes: Route[] = [
  ...rootRoutes,
  ...dailyNoteRoutes,
  ...noteRoutes,
  ...openRoutes,
  ...searchRoutes,
];
