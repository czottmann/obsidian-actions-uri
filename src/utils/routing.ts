import { Vault } from "obsidian";
import { z } from "zod";
import { AnyParams, Route } from "../routes";
import { IncomingBaseParams } from "../schemata";
import { AnyHandlerResult, HandlerTextSuccess } from "../types";
import { showBrandedNotice } from "./grabbag";

/**
 * Prefixes the `path` value of each of the passed-in routes. Used for
 * namespacing routes: this way the risk of typos in the path values is reduced
 * and you don't have to type the action path over and over.
 *
 * @param namespace - A path prefix to be used for all routes
 * @param routes - An array of route objects
 *
 * @returns The array of `Route` objects with each `path` value prefixed
 *
 * @example
 * For a `namespace` of "herp":
 *
 * - In: `[ { path: "derp", schema: …, handler: … }, … ]`
 * - Out: `[ { path: "herp/derp", schema: …, handler: … }, … ]`
 */
export function namespaceRoutes(namespace: string, routes: Route[]): Route[] {
  return routes.map((r) => {
    return { ...r, path: `${namespace}/${r.path}` };
  });
}

export function helloRoute(path: string = ""): Route {
  return { path, schema: z.object({}), handler: handleHello };
}

async function handleHello(
  data: AnyParams,
  vault: Vault,
): Promise<AnyHandlerResult> {
  showBrandedNotice("… is ready for action 🚀");

  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
    input: data as IncomingBaseParams,
  };
}
