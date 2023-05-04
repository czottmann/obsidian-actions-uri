import { apiVersion, Platform } from "obsidian";
import { z } from "zod";
import { PLUGIN_INFO } from "../plugin-info";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerInfoSuccess } from "../types";

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
  incomingParams: AnyParams,
): Promise<HandlerInfoSuccess> {
  const uaMatch = navigator.userAgent.match(/\((.+?)\)/);
  const os: string = uaMatch ? uaMatch[1] : "unknown";
  const { isAndroidApp, isDesktopApp, isIosApp, isMacOS, isMobile } = Platform;

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

  return {
    isSuccess: true,
    result: {
      ...PLUGIN_INFO,
      apiVersion,
      nodeVersion: window.process?.version?.replace(/^v/, "") || "N/A",
      platform,
      os,
    },
  };
}
