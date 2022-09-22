import { z } from "zod";
import { basePayload } from "../schemata";
import { Route } from "../types";
import { showBrandedNotice } from "../utils";

// SCHEMATA --------------------

const IncomingBasePayload = z.object(basePayload);

// ROUTES --------------------

export const routes: Route[] = [
  {
    path: "",
    schema: IncomingBasePayload,
    handler: handleRoot,
  },
  // --------------------
];

// HANDLERS --------------------

function handleRoot(_: {}) {
  showBrandedNotice("… is ready for action 🚀");
}
