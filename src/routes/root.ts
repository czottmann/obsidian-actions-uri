import { RoutePath } from "../routes";
import { helloRoute } from "../utils/routing";

// ROUTES --------------------

export const routePath: RoutePath = {
  "/": [
    // ## `/`
    //
    // Does nothing but say hello.
    helloRoute(),
  ],
};
