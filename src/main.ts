import { dirname, extname } from "path";
import { ObsidianProtocolData, Plugin, TFile, TFolder } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  createDailyNote,
  getAllDailyNotes,
  getDailyNote,
} from "obsidian-daily-notes-interface";
import { z } from "zod";

import { handleParseError } from "./handlers";
import { Route, routes } from "./routes";
import { sanitizeFilePath } from "./utils";
import { IncomingBasePayload } from "./validators";

const URI_NAMESPACE = "actions-uri";

export default class ActionsURI extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerRoutes(routes);

      this.writeOrUpdateFile("//../folder/./test/test.md", "test");
      this.writeOrUpdateFile("../folder/./test/test.md", "test update");
      this.writeOrUpdateFile("folder/test/test 2.md", "test 2");

      console.log(
        appHasDailyNotesPluginLoaded(),
        getDailyNote(window.moment(), getAllDailyNotes()),
        // createDailyNote(window.moment()),
      );
    });
  }

  onunload() {
  }

  registerRoutes(routes: Route[]) {
    routes.forEach((route) => {
      const { path, schema, handler } = route;

      this.registerObsidianProtocolHandler(
        this.buildActionPath(path),
        async (incoming) => {
          const parsedPayload = schema.safeParse(incoming);

          if (parsedPayload.success) {
            handler.bind(
              this,
              parsedPayload.data as z.infer<typeof IncomingBasePayload>,
            )();
          } else {
            handleParseError.bind(this, parsedPayload.error)();
          }
        },
      );
    });
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

  // Building a namespaced action string used in the Obsidian protocol handler.
  private buildActionPath(path: string) {
    return [URI_NAMESPACE, path.split("/")]
      .flat()
      .filter((x) => !!x)
      .join("/");
  }
}
