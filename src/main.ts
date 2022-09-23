import { Plugin } from "obsidian";
import { AnyZodObject, ZodError } from "zod";
import { createOrOverwriteNote } from "./file-handling";
import { PayloadUnion, routes } from "./routes";
import {
  AnyResult,
  Route,
  SuccessfulFileResult,
  SuccessfulResult,
  SuccessfulStringResult,
  UnsuccessfulResult,
  ZodSafeParseSuccessData,
} from "./types";
import { showBrandedNotice } from "./utils";

export default class ActionsURI extends Plugin {
  static readonly URI_NAMESPACE = "actions-uri";

  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerRoutes(routes);

      createOrOverwriteNote(
        "//../folder/./test/test.md",
        "test",
        this.app.vault,
      );
      createOrOverwriteNote(
        "../folder/./test/test.md",
        "test update",
        this.app.vault,
      );
      createOrOverwriteNote("folder/test/test 2.md", "test 2", this.app.vault);

      // console.log(
      //   appHasDailyNotesPluginLoaded(),
      //   getDailyNote(window.moment(), getAllDailyNotes()),
      //   // createDailyNote(window.moment()),
      // );
    });
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
                .bind(
                  this,
                  parsedPayload.data as ZodSafeParseSuccessData,
                  this.app.vault,
                )();

              this.sendCallBackToSenderIfNecessary(result);
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

  private sendCallBackToSenderIfNecessary(result: AnyResult) {
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
      result = <SuccessfulResult> result;

      if (input["x-success"]) {
        console.log(`TODO: Send success callback to ${input["x-success"]}`);
        console.log(result.data);
      }
    } else {
      result = <UnsuccessfulResult> result;

      if (input["x-error"]) {
        console.log(
          `TODO: Send error callback to ${input["x-error"]}: ${result.error}`,
        );
      }
    }

    return;

    // const url = new URL(input["x-success"]);
    // for (const param in options) {
    //   url.searchParams.set(param, options[param]);
    // }
    // window.open(url.toString());
  }
}

// class Result {
//   readonly input: unknown;
//   readonly error?: string;
//   readonly success: boolean;
//   readonly data: unknown;

//   constructor({input: unknown, error?: string, success: boolean, data: unknown) {
//     this.input = input;
//     this.error = error;
//     this.success = success;
//     this.data = data;
//   }
// }
