import { apiVersion, Platform } from "obsidian";
import { z } from "zod";
import { PLUGIN_INFO } from "src/plugin-info";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import { HandlerInfoSuccess } from "src/types";
import { success } from "src/utils/results-handling";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/info": [
    { path: "/", schema: defaultParams, handler: handleInfo },
  ],
};

// HANDLERS --------------------

async function handleInfo(
  params: DefaultParams,
): Promise<HandlerInfoSuccess> {
  const uaMatch = navigator.userAgent.match(/\((.+?)\)/);
  const os: string = uaMatch ? uaMatch[1] : "unknown";
  const { isAndroidApp, isDesktopApp, isIosApp, isMacOS } = Platform;

  let platform = "";
  if (isDesktopApp && isMacOS) {
    platform = "macOS";
  } else if (isDesktopApp) {
    platform = "Windows/Linux";
  } else if (isIosApp) {
    platform = "iOS";
  } else if (isAndroidApp) {
    platform = "Android";
  }

  return success({
    ...PLUGIN_INFO,
    apiVersion,
    nodeVersion: window.process?.version?.replace(/^v/, "") || "N/A",
    platform,
    os,
  });
}
