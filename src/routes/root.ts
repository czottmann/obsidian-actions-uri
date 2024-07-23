import { RoutePath } from "src/routes";
import { helloRoute } from "src/utils/routing";

// ROUTES --------------------

export const routePath: RoutePath = {
  "/": [
    helloRoute(),
  ],
};
