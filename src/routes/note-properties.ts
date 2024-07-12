import { stringifyYaml } from "obsidian";
import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams, noteTargetingParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPropertiesSuccess,
} from "../types";
import { propertiesForFile, updateNote } from "../utils/file-handling";
import { hardValidateNoteTargetingAndResolvePath } from "../utils/parameters";
import { helloRoute } from "../utils/routing";
import { success } from "../utils/results-handling";
import { zodJsonPropertiesObject, zodJsonStringArray } from "../utils/zod";

// SCHEMATA ----------------------------------------

const getParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type GetParams = z.infer<typeof getParams>;

const setParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    properties: zodJsonPropertiesObject,
    mode: z.enum(["overwrite", "update"]).optional(),
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type SetParams = z.infer<typeof setParams>;

const removeKeysParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    keys: zodJsonStringArray,
  })
  .transform(hardValidateNoteTargetingAndResolvePath);
type RemoveKeysParams = z.infer<typeof removeKeysParams>;

export type AnyLocalParams =
  | GetParams
  | SetParams
  | RemoveKeysParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/note-properties": [
    helloRoute(),
    { path: "/get", schema: getParams, handler: handleGet },
    { path: "/set", schema: setParams, handler: handleSet },
    { path: "/clear", schema: getParams, handler: handleClear },
    {
      path: "/remove-keys",
      schema: removeKeysParams,
      handler: handleRemoveKeys,
    },
  ],
};

// HANDLERS --------------------

async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerPropertiesSuccess | HandlerFailure> {
  const { _computed: { tFile } } = incomingParams as GetParams;
  return success({ properties: propertiesForFile(tFile!) });
}

async function handleSet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _computed: { tFile }, mode, properties } =
    incomingParams as SetParams;
  const props = mode === "update"
    ? { ...propertiesForFile(tFile!), ...properties }
    : properties;

  return updateNote(tFile!.path, stringifyYaml(props).trim());
}

async function handleClear(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _computed: { path } } = incomingParams as GetParams;
  return updateNote(path, "");
}

async function handleRemoveKeys(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _computed: { path, tFile }, keys } =
    incomingParams as RemoveKeysParams;

  const props = propertiesForFile(tFile!)!;
  (<string[]> keys).forEach((key) => delete props[key]);

  return updateNote(path, stringifyYaml(props).trim());
}
