import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerFailure, HandlerVaultSuccess } from "../types";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/vault": [
    // ## `/vault`
    //
    // Does nothing but say hello.
    helloRoute(),

    { path: "/open", schema: defaultParams, handler: handleOpen },
    { path: "/close", schema: defaultParams, handler: handleClose },
  ],
};

// HANDLERS --------------------

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  // If we're here, then the vault is already open.
  return {
    isSuccess: true,
    result: {},
  };
}

async function handleClose(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  // This feels wonky, like a race condition waiting to happen.
  window.setTimeout(window.close, 600);
  return {
    isSuccess: true,
    result: {},
  };
}
