import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFilePathSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "../types";
import { getFile, renameFilepath, trashFilepath } from "../utils/file-handling";
import { obsEnv } from "../utils/obsidian-env";
import { helloRoute } from "../utils/routing";
import { failure, success } from "../utils/results-handling";
import {
  zodAlwaysFalse,
  zodExistingFilePath,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

const openParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  silent: zodAlwaysFalse,
});
type OpenParams = z.infer<typeof openParams>;

const deleteParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
});
type DeleteParams = z.infer<typeof deleteParams>;

const renameParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  "new-filename": zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});
type RenameParams = z.infer<typeof renameParams>;

export type AnyLocalParams =
  | DefaultParams
  | OpenParams
  | DeleteParams
  | RenameParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/file": [
    helloRoute(),
    { path: "/list", schema: defaultParams, handler: handleList },
    { path: "/get-active", schema: defaultParams, handler: handleGetActive },
    { path: "/open", schema: openParams, handler: handleOpen },
    { path: "/delete", schema: deleteParams, handler: handleDelete },
    { path: "/trash", schema: deleteParams, handler: handleTrash },
    { path: "/rename", schema: renameParams, handler: handleRename },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: obsEnv.activeVault.getFiles().map((t) => t.path).sort(),
  });
}

async function handleGetActive(
  incomingParams: AnyParams,
): Promise<HandlerFilePathSuccess | HandlerFailure> {
  const res = obsEnv.activeWorkspace.getActiveFile();
  return res ? success({ filepath: res.path }) : failure(404, "No active file");
}

async function handleOpen(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <OpenParams> incomingParams;

  const res = await getFile(file.path);
  return res.isSuccess
    ? success({ message: STRINGS.file_opened }, file.path)
    : res;
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const filepath = file.path;

  const res = await trashFilepath(filepath, true);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = <DeleteParams> incomingParams;
  const filepath = file.path;

  const res = await trashFilepath(filepath);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <RenameParams> incomingParams;
  const filepath = params.file.path;

  const res = await renameFilepath(filepath, params["new-filename"]);
  return res.isSuccess ? success({ message: res.result }, filepath) : res;
}
