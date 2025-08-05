import { stringifyYaml } from "obsidian";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { incomingBaseParams, noteTargetingParams } from "src/schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerPropertiesSuccess,
  Prettify,
} from "src/types";
import {
  getNote,
  getNoteDetails,
  propertiesForFile,
  updateNote,
} from "src/utils/file-handling";
import { resolveNoteTargetingStrict } from "src/utils/parameters";
import { helloRoute } from "src/utils/routing";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { self } from "src/utils/self";
import {
  zodJsonPropertiesObject,
  zodJsonStringArray,
  zodOptionalBoolean,
} from "src/utils/zod";

// SCHEMATA ----------------------------------------

const getParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    silent: zodOptionalBoolean,
    "x-error": z.string().url(),
    "x-success": z.string().url(),
  })
  .transform(resolveNoteTargetingStrict);

const setParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    properties: zodJsonPropertiesObject,
    mode: z.enum(["overwrite", "update"]).optional(),
  })
  .transform(resolveNoteTargetingStrict);

const removeKeysParams = incomingBaseParams
  .merge(noteTargetingParams)
  .extend({
    keys: zodJsonStringArray,
  })
  .transform(resolveNoteTargetingStrict);

// TYPES ----------------------------------------

type GetParams = Prettify<z.infer<typeof getParams>>;
type SetParams = Prettify<z.infer<typeof setParams>>;
type RemoveKeysParams = Prettify<z.infer<typeof removeKeysParams>>;

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
  params: GetParams,
): Promise<HandlerPropertiesSuccess | HandlerFailure> {
  const { _resolved: { inputFile } } = params;
  return success(
    { properties: await propertiesForFile(inputFile!) },
    inputFile?.path,
  );
}

async function handleSet(
  params: SetParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _resolved: { inputFile }, mode, properties } = params;
  const { path } = inputFile!;

  if (mode === "update") {
    const resNote = await getNote(path);
    if (!resNote.isSuccess) {
      return resNote;
    }

    try {
      self().app.fileManager.processFrontMatter(
        resNote.result,
        (frontmatter) => Object.assign(frontmatter, properties),
      );
      return getNoteDetails(path);
    } catch (err) {
      return failure(
        ErrorCode.unableToWrite,
        STRINGS.properties.unable_to_update,
      );
    }
  } else {
    return updateNote(path, sanitizedStringifyYaml(properties));
  }
}

async function handleClear(
  params: GetParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _resolved: { inputPath: path } } = params;
  return updateNote(path, "");
}

async function handleRemoveKeys(
  params: RemoveKeysParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const { _resolved: { inputPath: path, inputFile }, keys } = params;

  const props = await propertiesForFile(inputFile!)!;
  (<string[]> keys).forEach((key) => delete props[key]);

  return updateNote(path, sanitizedStringifyYaml(props));
}

function sanitizedStringifyYaml(props: any): string {
  return Object.keys(props).length > 0 ? stringifyYaml(props).trim() : "";
}
