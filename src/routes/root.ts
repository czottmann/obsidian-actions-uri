import { Route } from "../routes";
import { helloRoute } from "../utils/routing";

// ROUTES --------------------

export const routes: Route[] = [
  // ## `/`
  //
  // Does nothing but say hello.
  helloRoute(),
];
