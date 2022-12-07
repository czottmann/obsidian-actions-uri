import { Platform } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerVaultInfoSuccess,
  HandlerVaultSuccess,
  RealLifeDataAdapter,
  RealLifeVault,
} from "../types";
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
    { path: "/open", schema: defaultParams, handler: handleOpen },
    { path: "/close", schema: defaultParams, handler: handleClose },
    { path: "/info", schema: defaultParams, handler: handleInfo },
  ],
};

// HANDLERS --------------------

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  // If we're here, then the vault is already open.
  return {
    isSuccess: true,
    result: {},
  };
}

async function handleClose(
  incomingParams: AnyParams,
): Promise<HandlerVaultSuccess | HandlerFailure> {
  if (!Platform.isMobileApp) {
    return {
      isSuccess: false,
      errorCode: 405,
      errorMessage: STRINGS.not_available_on_mobile,
    };
  }

  // This feels wonky, like a race condition waiting to happen.
  window.setTimeout(window.close, 600);
  return {
    isSuccess: true,
    result: {},
  };
}

async function handleInfo(
  incomingParams: AnyParams,
): Promise<HandlerVaultInfoSuccess | HandlerFailure> {
  const { vault } = window.app;
  const { config } = <RealLifeVault> vault;
  const basePath = (<RealLifeDataAdapter> vault.adapter).basePath;

  if (!config || !basePath) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.vault_internals_not_found,
    };
  }

  let newFileFolderPath = "";

  switch (config.newFileLocation) {
    case "root":
    case "current":
      newFileFolderPath = basePath;
      break;
    case "folder":
      newFileFolderPath = `${basePath}/${config.newFileFolderPath}`
        .replace(/\/$/, "");
      break;
  }

  const attachmentFolderPath = `${basePath}/${config.attachmentFolderPath}`
    .replace(/\/$/, "");

  return {
    isSuccess: true,
    result: {
      basePath,
      attachmentFolderPath,
      newFileFolderPath,
    },
  };
}
