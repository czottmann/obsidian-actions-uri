import { stringifyYaml } from "obsidian";
import { z } from "zod";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPropertiesSuccess,
  TFileResultObject,
} from "../types";
import { getNote, propertiesForFile, updateNote } from "../utils/file-handling";
import {
  getPeriodNotePathIfPluginIsAvailable,
  PeriodicNoteType,
} from "../utils/periodic-notes-handling";
import { helloRoute } from "../utils/routing";
import { success } from "../utils/results-handling";
import {
  zodExistingNotePath,
  zodJsonPropertiesObject,
  zodJsonStringArray,
} from "../utils/zod";

// SCHEMATA ----------------------------------------

const defaultFileParams = incomingBaseParams.extend({
  file: zodExistingNotePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultFileParams = z.infer<typeof defaultFileParams>;

const defaultPeriodicNoteParams = incomingBaseParams.extend({
  "periodic-note": z.nativeEnum(PeriodicNoteType),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultPeriodicNoteParams = z.infer<typeof defaultPeriodicNoteParams>;

const getParams = z.union([defaultFileParams, defaultPeriodicNoteParams]);
type GetParams = z.infer<typeof getParams>;

const setParams = z.union([
  defaultFileParams.extend({
    properties: zodJsonPropertiesObject,
    mode: z.enum(["overwrite", "update"]).optional(),
  }),
  defaultPeriodicNoteParams.extend({
    properties: zodJsonPropertiesObject,
    mode: z.enum(["overwrite", "update"]).optional(),
  }),
]);
type SetParams = z.infer<typeof setParams>;

const removeKeysParams = z.union([
  defaultFileParams.extend({
    keys: zodJsonStringArray,
  }),
  defaultPeriodicNoteParams.extend({
    keys: zodJsonStringArray,
  }),
]);

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
  const params = <GetParams> incomingParams;
  const resFile = await getTargetTFile(params);
  if (!resFile.isSuccess) return resFile;

  return success({ properties: propertiesForFile(resFile.result) });
}

async function handleSet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <SetParams> incomingParams;

  const resFile = await getTargetTFile(params);
  if (!resFile.isSuccess) return resFile;
  const file = resFile.result;

  const { mode, properties } = params;
  const props = mode === "update"
    ? { ...propertiesForFile(file), ...properties }
    : properties;

  return updateNote(file.path, stringifyYaml(props).trim());
}

async function handleClear(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <GetParams> incomingParams;

  const resFile = await getTargetTFile(params);
  if (!resFile.isSuccess) return resFile;
  const file = resFile.result;

  return updateNote(file.path, "");
}

async function handleRemoveKeys(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <RemoveKeysParams> incomingParams;

  const resFile = await getTargetTFile(params);
  if (!resFile.isSuccess) return resFile;
  const file = resFile.result;

  const { keys } = params;
  const props = propertiesForFile(file)!;
  (<string[]> keys).forEach((key) => delete props[key]);

  return updateNote(file.path, stringifyYaml(props).trim());
}

// HELPERS --------------------

function paramsContainFilePath(params: AnyParams): boolean {
  return "file" in params;
}

async function getTargetTFile(
  params: AnyParams,
): Promise<TFileResultObject> {
  // Target is a file path
  if (paramsContainFilePath(params)) {
    return success((<DefaultFileParams> params).file);
  }

  const periodicID = (<DefaultPeriodicNoteParams> params)["periodic-note"];
  const res = getPeriodNotePathIfPluginIsAvailable(periodicID);
  if (!res.isSuccess) return res;

  const filepath = res.result;
  return await getNote(filepath);
}
