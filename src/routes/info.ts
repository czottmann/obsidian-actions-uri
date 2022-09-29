import { z } from "zod";
import { PLUGIN_INFO } from "../plugin-info";
import { AnyParams, Route } from "../routes";
import { incomingBaseParams } from "../schemata";
import { AnyHandlerResult, HandlerInfoSuccess } from "../types";
import { namespaceRoutes } from "../utils/routing";
import { logToConsole } from "../utils/ui";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routes: Route[] = namespaceRoutes("info", [
  // ## `/info`
  //
  // Returns information about the plugin and the current Obsidian instance.
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error": string;
  //     "x-success": string;
  //     action: string;
  //     vault: string;
  // }
  // => HandlerInfoSuccess
  { path: "", schema: defaultParams, handler: handleInfo },
]);

// HANDLERS --------------------

async function handleInfo(
  incomingParams: AnyParams,
): Promise<HandlerInfoSuccess> {
  const uaMatch = navigator.userAgent.match(/\((.+?)\).+obsidian\/(\S+)/);
  let platform: string = "";
  let obsidianVersion: string = "";

  if (uaMatch) {
    [, platform, obsidianVersion] = uaMatch;
  }

  return <HandlerInfoSuccess> {
    isSuccess: true,
    result: {
      ...PLUGIN_INFO,
      obsidianVersion,
      nodeVersion: process.version,
      os: platform,
    },
  };
}
