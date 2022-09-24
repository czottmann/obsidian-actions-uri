import { Plugin } from "obsidian";
import { ZodError } from "zod";
import { PayloadUnion, routes } from "./routes";
import {
  AnyResult,
  Route,
  SuccessfulResult,
  UnsuccessfulResult,
  ZodSafeParseSuccessData,
} from "./types";
import { sendUrlCallback, showBrandedNotice } from "./utils";

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
    const registeredRoutes: string[] = [];

    for (const route of routes) {
      const { path, schema, handler } = route;
      const paths = Array.isArray(path) ? path : [path];

      for (const p of paths) {
        const actionPath = this.buildActionPath(p);

        this.registerObsidianProtocolHandler(
          actionPath,
          async (incoming) => {
            const parsedPayload = schema.safeParse(incoming);

            if (parsedPayload.success) {
              const result = await handler
                .apply(this, [
                  parsedPayload.data as ZodSafeParseSuccessData,
                  this.app.vault,
                ]);

              this.sendUrlCallbackIfNeeded(result);
            } else {
              this.handleParseError(parsedPayload.error);
            }
          },
        );

        registeredRoutes.push(actionPath);
      }
    }

    console.info("Registered URI handlers:");
    console.info(
      registeredRoutes.map((path) => `- obsidian://${path}`).join("\n"),
    );
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
   */
  private buildActionPath(path: string) {
    return [ActionsURI.URI_NAMESPACE, path.split("/")]
      .flat()
      .filter((x) => !!x)
      .join("/");
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
   * @param result - A `*Result` object returned by a route handler
   *
   * @see {@link sendUrlCallback}
   */
  private sendUrlCallbackIfNeeded(result: AnyResult) {
    const { success } = result;
    const input = result.input as PayloadUnion;

    if (input.hasOwnProperty("silent")) {
      console.log("Silent call, not sending callback");
      return;
    }

    if (!input["x-success"] && !input["x-error"]) {
      console.log("No callbacks specified");
      return;
    }

    if (success) {
      if (input["x-success"]) {
        sendUrlCallback(input["x-success"], <SuccessfulResult> result);
      }
    } else {
      if (input["x-error"]) {
        sendUrlCallback(input["x-error"], <UnsuccessfulResult> result);
      }
    }
  }
}
