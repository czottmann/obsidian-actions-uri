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

  private registerRoutes(routes: Route[]) {
    const registeredRoutes: string[] = [];

    routes.forEach((route) => {
      const { path, schema, handler } = route;
      const paths = Array.isArray(path) ? path : [path];

      paths.forEach((p) => {
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
      });
    });

    console.info("Registered URI handlers:");
    console.info(
      registeredRoutes.map((path) => `- obsidian://${path}`).join("\n"),
    );
  }

  // Building a namespaced action string used in the Obsidian protocol handler.
  private buildActionPath(path: string) {
    return [ActionsURI.URI_NAMESPACE, path.split("/")]
      .flat()
      .filter((x) => !!x)
      .join("/");
  }

  private handleParseError(parseError: ZodError) {
    const msg = [
      "Incoming call failed",
      parseError.errors
        .map((error) => `- ${error.path.join(".")}: ${error.message}`),
    ].flat().join("\n");

    console.error(msg);
    showBrandedNotice(msg);
  }

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
