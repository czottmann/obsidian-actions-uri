import { stringifyYaml } from "obsidian";
import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPropertiesSuccess,
} from "../types";
import { propertiesForFile, updateNote } from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import { success } from "../utils/results-handling";
import {
  zodExistingNotePath,
  zodJsonPropertiesObject,
  zodJsonStringArray,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const defaultParams = incomingBaseParams.extend({
  file: zodExistingNotePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

const setParams = defaultParams.extend({
  properties: zodJsonPropertiesObject,
  mode: z.enum(["overwrite", "update"]).optional(),
});
type SetParams = z.infer<typeof setParams>;

const removeKeysParams = defaultParams.extend({
  keys: zodJsonStringArray,
});
type RemoveKeysParams = z.infer<typeof removeKeysParams>;

export type AnyLocalParams =
  | DefaultParams
  | SetParams
  | RemoveKeysParams;

// ROUTES --------------------

export const routePath: RoutePath = {
  "/note-properties": [
    helloRoute(),
    { path: "/get", schema: defaultParams, handler: handleGet },
    { path: "/set", schema: setParams, handler: handleSet },
    { path: "/clear", schema: defaultParams, handler: handleClear },
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
  const params = <DefaultParams> incomingParams;
  const { file } = params;

  return success({ properties: propertiesForFile(file) });
}

async function handleSet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <SetParams> incomingParams;
  const { file, mode, properties } = params;

  const props = mode === "update"
    ? { ...propertiesForFile(file), ...properties }
    : properties;

  return updateNote(file.path, stringifyYaml(props).trim());
}

async function handleClear(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <SetParams> incomingParams;
  const { file } = params;

  return updateNote(file.path, "");
}

async function handleRemoveKeys(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <RemoveKeysParams> incomingParams;
  const { file, keys } = params;

  const props = propertiesForFile(file)!;
  (<string[]> keys).forEach((key) => delete props[key]);

  return updateNote(file.path, stringifyYaml(props).trim());
}
