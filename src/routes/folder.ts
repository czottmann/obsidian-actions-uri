import { TFolder } from "obsidian";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  createFolderIfNecessary,
  getFileMap,
  renameFilepath,
  trashFilepath,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import { zodSanitizedFolderPath } from "../utils/zod";
import { success } from "src/utils/results-handling";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

const createParams = incomingBaseParams.extend({
  folder: zodSanitizedFolderPath,
});
type CreateParams = z.infer<typeof createParams>;

const deleteParams = incomingBaseParams.extend({
  folder: zodSanitizedFolderPath,
});
type DeleteParams = z.infer<typeof deleteParams>;

const renameParams = incomingBaseParams.extend({
  folder: zodSanitizedFolderPath,
  "new-foldername": zodSanitizedFolderPath,
});
type RenameParams = z.infer<typeof renameParams>;

export type AnyLocalParams =
  | ListParams
  | CreateParams
  | DeleteParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/folder": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    { path: "/create", schema: createParams, handler: handleCreate },
    { path: "/rename", schema: renameParams, handler: handleRename },
    { path: "/delete", schema: deleteParams, handler: handleDelete },
    { path: "/trash", schema: deleteParams, handler: handleTrash },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  incomingParams: AnyParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  const paths = getFileMap()
    .filter((t) => t instanceof TFolder)
    .map((t) => t.path.endsWith("/") ? t.path : `${t.path}/`).sort();

  return success({ paths });
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const { folder } = params;

  await createFolderIfNecessary(folder);
  return success({ message: STRINGS.folder_created }, folder);
}

async function handleRename(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <RenameParams> incomingParams;
  const { folder } = params;
  const res = await renameFilepath(folder, params["new-foldername"]);

  return res.isSuccess ? success({ message: res.result }, folder) : res;
}

async function handleDelete(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <DeleteParams> incomingParams;
  const { folder } = params;
  const res = await trashFilepath(folder, true);

  return res.isSuccess ? success({ message: res.result }, folder) : res;
}

async function handleTrash(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <DeleteParams> incomingParams;
  const { folder } = params;
  const res = await trashFilepath(folder);

  return res.isSuccess ? success({ message: res.result }, folder) : res;
}
