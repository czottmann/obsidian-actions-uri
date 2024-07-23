import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerFilePathSuccess,
  HandlerPathsSuccess,
  HandlerTextSuccess,
  RealLifePlugin,
} from "src/types";
import {
  getFile,
  renameFilepath,
  trashFilepath,
} from "src/utils/file-handling";
import { helloRoute } from "src/utils/routing";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import {
  zodExistingFilePath,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "src/utils/zod";

// SCHEMATA ----------------------------------------

const defaultParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const openParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
});

const deleteParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
});

const renameParams = incomingBaseParams.extend({
  file: zodExistingFilePath,
  "new-filename": zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

// TYPES ----------------------------------------

type DefaultParams = z.infer<typeof defaultParams>;
type OpenParams = z.infer<typeof openParams>;
type DeleteParams = z.infer<typeof deleteParams>;
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
  this: RealLifePlugin,
  params: DefaultParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: this.app.vault.getFiles().map((t) => t.path).sort(),
  });
}

async function handleGetActive(
  this: RealLifePlugin,
  params: DefaultParams,
): Promise<HandlerFilePathSuccess | HandlerFailure> {
  const res = this.app.workspace.getActiveFile();
  return res
    ? success({ filepath: res.path })
    : failure(ErrorCode.NotFound, "No active file");
}

async function handleOpen(
  params: OpenParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = params;
  const res = await getFile(file.path);
  return res.isSuccess
    ? success({ message: STRINGS.file_opened }, file.path)
    : res;
}

async function handleDelete(
  params: DeleteParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = params;
  const res = await trashFilepath(file.path, true);
  return res.isSuccess ? success({ message: res.result }, file.path) : res;
}

async function handleTrash(
  params: DeleteParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = params;
  const res = await trashFilepath(file.path);
  return res.isSuccess ? success({ message: res.result }, file.path) : res;
}

async function handleRename(
  params: RenameParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { file } = params;
  const res = await renameFilepath(file.path, params["new-filename"]);
  return res.isSuccess ? success({ message: res.result }, file.path) : res;
}
