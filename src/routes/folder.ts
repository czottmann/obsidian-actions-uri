import { TFolder } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerPathsSuccess,
  HandlerTextSuccess,
} from "src/types";
import {
  createFolderIfNecessary,
  getFileMap,
  renameFilepath,
  trashFilepath,
} from "src/utils/file-handling";
import { helloRoute } from "src/utils/routing";
import { zodExistingFolderPath, zodSanitizedFolderPath } from "src/utils/zod";
import { success } from "src/utils/results-handling";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const createParams = incomingBaseParams.extend({
  folder: zodSanitizedFolderPath,
});

const deleteParams = incomingBaseParams.extend({
  folder: zodExistingFolderPath,
});

const renameParams = incomingBaseParams.extend({
  folder: zodExistingFolderPath,
  "new-foldername": zodSanitizedFolderPath,
});

// TYPES ----------------------------------------

type ListParams = z.infer<typeof listParams>;
type CreateParams = z.infer<typeof createParams>;
type DeleteParams = z.infer<typeof deleteParams>;
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
  params: ListParams,
): Promise<HandlerPathsSuccess | HandlerFailure> {
  return success({
    paths: getFileMap()
      .filter((t) => t instanceof TFolder)
      .map((t) => t.path.endsWith("/") ? t.path : `${t.path}/`).sort(),
  });
}

async function handleCreate(
  params: CreateParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { folder } = params;
  await createFolderIfNecessary(folder);
  return success({ message: STRINGS.folder_created }, folder);
}

async function handleRename(
  params: RenameParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { folder } = params;
  const res = await renameFilepath(folder.path, params["new-foldername"]);
  return res.isSuccess ? success({ message: res.result }, folder.path) : res;
}

async function handleDelete(
  params: DeleteParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { folder } = params;
  const res = await trashFilepath(folder.path, true);
  return res.isSuccess ? success({ message: res.result }, folder.path) : res;
}

async function handleTrash(
  params: DeleteParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const { folder } = params;
  const res = await trashFilepath(folder.path);
  return res.isSuccess ? success({ message: res.result }, folder.path) : res;
}
