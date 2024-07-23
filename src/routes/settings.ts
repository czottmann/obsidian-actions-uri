import { z } from "zod";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import { HandlerTextSuccess, RealLifePlugin } from "src/types";
import { success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams;

// TYPES ----------------------------------------

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
  params: DefaultParams,
): Promise<HandlerTextSuccess> {
  const setting = this.app.setting;
  setting.open();
  setting.openTabById(this.manifest.id);
  return success({ message: "Opened settings UI" });
}
