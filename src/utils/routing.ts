import { AnyParams, Route } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerTextSuccess } from "../types";
import { showBrandedNotice } from "./ui";
import { URI_NAMESPACE } from "../constants";

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
 * - Out: `[ { path: "actions-uri/herp/derp", schema: …, handler: … }, … ]`
 */
export function namespaceRoutes(namespace: string, routes: Route[]): Route[] {
  return routes.map((r) => ({
    ...r,
    path: `${URI_NAMESPACE}/${namespace}/${r.path}`
      .split("/")
      .filter((p) => !!p)
      .join("/"),
  }));
}

export function helloRoute(path: string = ""): Route {
  return { path, schema: incomingBaseParams.extend({}), handler: handleHello };
}

async function handleHello(data: AnyParams): Promise<HandlerTextSuccess> {
  showBrandedNotice("… is ready for action 🚀");

  return <HandlerTextSuccess> {
    isSuccess: true,
    result: { message: "" },
  };
}
