import { Plugin } from "obsidian";
import { ZodError } from "zod";
import { createOrOverwriteNote } from "./file-handling";
import { routes } from "./routes";
import { Route, ZodSafeParseSuccessData } from "./types";
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
              handler.bind(
                this,
                parsedPayload.data as ZodSafeParseSuccessData,
                this.app.vault,
              )();
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
}
