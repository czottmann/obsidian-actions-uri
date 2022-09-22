import { dirname } from "path";
import { Plugin, TFile, TFolder } from "obsidian";
import { ZodError } from "zod";

import { routes as rootRoutes } from "./routes";
import { routes as dailyNoteRoutes } from "./routes.daily-note";
import { routes as noteRoutes } from "./routes.note";
import { routes as openRoutes } from "./routes.open";
import { Route, ZodSafeParseSuccessData } from "./types";
import { sanitizeFilePath, showBrandedNotice } from "./utils";

export default class ActionsURI extends Plugin {
  static readonly URI_NAMESPACE = "actions-uri";

  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerRoutes(rootRoutes);
      this.registerRoutes(dailyNoteRoutes);
      this.registerRoutes(noteRoutes);
      this.registerRoutes(openRoutes);

      // this.writeOrUpdateFile("//../folder/./test/test.md", "test");
      // this.writeOrUpdateFile("../folder/./test/test.md", "test update");
      // this.writeOrUpdateFile("folder/test/test 2.md", "test 2");

      // console.log(
      //   appHasDailyNotesPluginLoaded(),
      //   getDailyNote(window.moment(), getAllDailyNotes()),
      //   // createDailyNote(window.moment()),
      // );
    });
  }

  onunload() {
  }

  registerRoutes(routes: Route[]) {
    routes.forEach((route) => {
      const { path, schema, handler } = route;
      const paths = Array.isArray(path) ? path : [path];

      for (const p of paths) {
        const actionPath = this.buildActionPath(p);

        this.registerObsidianProtocolHandler(
          actionPath,
          async (incoming) => {
            const parsedPayload = schema.safeParse(incoming);

            if (parsedPayload.success) {
              const data = parsedPayload.data as ZodSafeParseSuccessData;
              handler.bind(this, data)();
            } else {
              this.handleParseError(parsedPayload.error);
            }
          },
        );

        console.info(`Registered URI handler for ${actionPath}`);
      }
    });
  }

  // Building a namespaced action string used in the Obsidian protocol handler.
  private buildActionPath(path: string) {
    return [ActionsURI.URI_NAMESPACE, path.split("/")]
      .flat()
      .filter((x) => !!x)
      .join("/");
  }

  handleParseError(parseError: ZodError) {
    const msg = [
      "Incoming call failed",
      parseError.errors
        .map((error) => `- ${error.path.join(".")}: ${error.message}`),
    ].flat().join("\n");

    console.error(msg);
    showBrandedNotice(msg);
  }

  async writeOrUpdateFile(
    filename: string,
    content: string,
  ): Promise<TFile> {
    filename = sanitizeFilePath(filename);

    const file = this.app.vault.getAbstractFileByPath(filename);
    const doesFileExist = file instanceof TFile;

    // Update the file if it already exists
    if (doesFileExist) {
      await this.app.vault.modify(file, content);
      return this.app.vault.getAbstractFileByPath(filename) as TFile;
    }

    // Create folder if necessary
    const folder = dirname(filename);
    if (folder !== "") {
      const doesFolderExist =
        this.app.vault.getAbstractFileByPath(folder) instanceof TFolder;

      if (!doesFolderExist) {
        await this.app.vault.createFolder(folder);
      }
    }

    // Create the new note
    await this.app.vault.create(filename, content);
    return this.app.vault.getAbstractFileByPath(filename) as TFile;
  }
}
