import { Platform } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { IncomingBaseParams, incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerPathsSuccess,
  HandlerVaultInfoSuccess,
  HandlerVaultSuccess,
  RealLifeDataAdapter,
  RealLifePlugin,
  RealLifeVault,
} from "src/types";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

// TYPES ----------------------------------------

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
  params: IncomingBaseParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  // If we're here, then the vault is already open.
  return success({});
}

async function handleClose(
  params: IncomingBaseParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  if (Platform.isMobileApp) {
    return failure(
      ErrorCode.FeatureUnavailable,
      STRINGS.not_available_on_mobile,
    );
  }

  // This feels wonky, like a race condition waiting to happen.
  window.setTimeout(window.close, 600);
  return success({});
}

async function handleInfo(
  this: RealLifePlugin,
  params: DefaultParams,
): Promise<HandlerVaultInfoSuccess | HandlerFailure> {
  const { vault } = this.app;
  const { config } = <RealLifeVault> vault;
  const basePath = (<RealLifeDataAdapter> vault.adapter).basePath;

  if (!config || !basePath) {
    return failure(ErrorCode.NotFound, STRINGS.vault_internals_not_found);
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
  params: DefaultParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: this.app.vault.getFiles().map((t) => t.path).sort(),
  });
}

async function handleListFilesExceptNotes(
  this: RealLifePlugin,
  params: DefaultParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  const { vault } = this.app;
  const files = vault.getFiles().map((t) => t.path);
  const notes = vault.getMarkdownFiles().map((t) => t.path);

  return success({
    paths: files.filter((path) => !notes.includes(path)).sort(),
  });
}
