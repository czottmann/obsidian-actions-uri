import { Plugin } from "obsidian";
import { normalize } from "path";
import { ZodError } from "zod";
import { routes } from "./routes";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerSuccess,
  Route,
  ZodSafeParsedData,
} from "./types";
import { sendUrlCallback } from "./utils/callbacks";
import { showBrandedNotice } from "./utils/grabbag";

export default class ActionsURI extends Plugin {
  static readonly URI_NAMESPACE = "actions-uri";

  async onload() {
    this.app.workspace.onLayoutReady(() => this.registerRoutes(routes));
  }

  onunload() {
  }

  /**
   * Takes a list of routes and registers them together with their handlers in
   * Obsidian.
   *
   * Each incoming call is first validated against the route's schema; if it
   * passes, its handler is called and a `x-success`/`x-error` callback is sent
   * out if needed. If the validation fails, an error message is shown to the
   * user.
   *
   * @param routes - An array of route objects
   */
  private registerRoutes(routes: Route[]) {
    const regdRoutes: string[] = [];
    const { vault } = this.app;

    for (const route of routes) {
      const { path, schema, handler } = route;
      const fullPath = this.buildFullPath(path);

      this.registerObsidianProtocolHandler(
        fullPath,
        async (incomingParams) => {
          const parsedPayload = schema.safeParse(incomingParams);
          if (parsedPayload.success) {
            const result = await handler
              .apply(this, [parsedPayload.data as ZodSafeParsedData, vault]);
            this.sendUrlCallbackIfNeeded(result);
          } else {
            this.handleParseError(parsedPayload.error);
          }
        },
      );
      regdRoutes.push(fullPath);
    }

    console.info("Registered URI handlers:");
    console.info(regdRoutes.map((path) => `- obsidian://${path}`).join("\n"));
  }

  /**
   * Building a namespaced action string used in the Obsidian protocol handler.
   * The input is normalized.
   *
   * @param path - The last segment of the action string
   *
   * @example
   * - `buildActionPath("herp")` // → "actions-uri/herp"
   * - `buildActionPath("herp/derp")` // → "actions-uri/herp/derp"
   * - `buildActionPath("/herp//derp")` // → "actions-uri/herp/derp"
   * - `buildActionPath(".././herp/../derp")` // → "actions-uri/derp"
   */
  private buildFullPath(path: string) {
    return `${ActionsURI.URI_NAMESPACE}/` +
      normalize(path).replace(/^[\.\/]+/g, "");
  }

  /**
   * When a payload failed to parse and can't be further processed, we show an
   * Obsidian notice to the user, conveying the error message.
   *
   * @param parseError - The error object returned from Zod's `.safeParse`
   * method
   */
  private handleParseError(parseError: ZodError) {
    const msg = [
      "Incoming call failed",
      parseError.errors
        .map((error) => `- ${error.path.join(".")}: ${error.message}`),
    ].flat().join("\n");

    console.error(msg);
    showBrandedNotice(msg);
  }

  /**
   * Using the passed-in result object the method determines whether we should
   * or even can send a URL callback to the original sender.
   *
   * If the original call contained a non-empty `silent` parameter, we don't
   * send a callback.
   *
   * Otherwise, we trigger callback sending if …
   * - the result object contains a success and a `x-success` parameter
   * - the result object contains a failure and a `x-error` parameter
   *
   * @param handlerRes - A `*Result` object returned by a route handler
   *
   * @see {@link sendUrlCallback}
   */
  private sendUrlCallbackIfNeeded(handlerRes: AnyHandlerResult) {
    const { isSuccess, input } = handlerRes;

    if (input.silent) {
      console.log("Silent call, not sending callback");
      return;
    }

    if (!input["x-success"] && !input["x-error"]) {
      console.log("No callbacks specified");
      return;
    }

    if (isSuccess) {
      if (input["x-success"]) {
        sendUrlCallback(input["x-success"], <HandlerSuccess> handlerRes);
      }
    } else {
      if (input["x-error"]) {
        sendUrlCallback(input["x-error"], <HandlerFailure> handlerRes);
      }
    }
  }
}
