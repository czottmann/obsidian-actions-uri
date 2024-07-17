import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerTextSuccess, RealLifePlugin } from "../types";
import { success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams;
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/settings": [
    helloRoute(),
    { path: "/open", schema: defaultParams, handler: handleOpen },
  ],
};

// HANDLERS --------------------

async function handleOpen(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess> {
  const setting = this.app.setting;
  setting.open();
  setting.openTabById(this.manifest.id);
  return success({ message: "Opened settings UI" });
}
