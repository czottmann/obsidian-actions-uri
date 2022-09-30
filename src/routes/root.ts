import { Route } from "../routes";
import { helloRoute, namespaceRoutes } from "../utils/routing";

// ROUTES --------------------

export const routes: Route[] = namespaceRoutes("", [
  // ## `/`
  //
  // Does nothing but say hello.
  helloRoute(),
]);
