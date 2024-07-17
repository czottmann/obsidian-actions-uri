import { Platform } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerPathsSuccess,
  HandlerVaultInfoSuccess,
  HandlerVaultSuccess,
  RealLifeDataAdapter,
  RealLifePlugin,
  RealLifeVault,
} from "../types";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/vault": [
    helloRoute(),
    { path: "/open", schema: incomingBaseParams, handler: handleOpen },
    { path: "/close", schema: incomingBaseParams, handler: handleClose },
    { path: "/info", schema: defaultParams, handler: handleInfo },
    {
      path: "/list-all-files",
      schema: defaultParams,
      handler: handleListFiles,
    },
    {
      path: "/list-non-notes-files",
      schema: defaultParams,
      handler: handleListFilesExceptNotes,
    },
  ],
};

// HANDLERS --------------------

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  // If we're here, then the vault is already open.
  return success({});
}

async function handleClose(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  if (Platform.isMobileApp) {
    return failure(405, STRINGS.not_available_on_mobile);
  }

  // This feels wonky, like a race condition waiting to happen.
  window.setTimeout(window.close, 600);
  return success({});
}

async function handleInfo(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerVaultInfoSuccess | HandlerFailure> {
  const vault = this.app.vault;
  const { config } = <RealLifeVault> vault;
  const basePath = (<RealLifeDataAdapter> vault.adapter).basePath;

  if (!config || !basePath) {
    return failure(412, STRINGS.vault_internals_not_found);
  }

  return success({
    basePath,
    attachmentFolderPath: `${basePath}/${config.attachmentFolderPath}`
      .replace(/\/$/, ""),
    newFileFolderPath: (
      config.newFileLocation === "folder"
        ? `${basePath}/${config.newFileFolderPath}`.replace(/\/$/, "")
        : basePath
    ),
  });
}

async function handleListFiles(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: this.app.vault.getFiles().map((t) => t.path).sort(),
  });
}

async function handleListFilesExceptNotes(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  const vault = this.app.vault;
  const files = vault.getFiles().map((t) => t.path);
  const notes = vault.getMarkdownFiles().map((t) => t.path);

  return success({
    paths: files.filter((path) => !notes.includes(path)).sort(),
  });
}
