import { z } from "zod";
import { TFile } from "obsidian";
import {
  AnyLocalParams as AnyCommandParams,
  routePath as commandRoutes,
} from "./routes/command";
import {
  AnyLocalParams as AnyDataviewParams,
  routePath as dataviewRoutes,
} from "./routes/dataview";
import {
  AnyLocalParams as AnyFileParams,
  routePath as fileRoutes,
} from "./routes/file";
import {
  AnyLocalParams as AnyFolderParams,
  routePath as folderRoutes,
} from "./routes/folder";
import {
  AnyLocalParams as AnyInfoParams,
  routePath as infoRoutes,
} from "./routes/info";
import {
  AnyLocalParams as AnyNoteParams,
  routePath as noteRoutes,
} from "./routes/note";
import {
  AnyLocalParams as AnyNotePropertiesParams,
  routePath as notePropertiesRoutes,
} from "./routes/note-properties";
import {
  AnyLocalParams as AnyOmnisearchParams,
  routePath as omnisearchRoutes,
} from "./routes/omnisearch";
import {
  AnyLocalParams as AnyPeriodicNoteParams,
  routePath as periodicNoteRoutes,
} from "./routes/periodic-notes";
import { routePath as rootRoutes } from "./routes/root";
import {
  AnyLocalParams as AnySearchParams,
  routePath as searchRoutes,
} from "./routes/search";
import {
  AnyLocalParams as AnyVaultParams,
  routePath as vaultRoutes,
} from "./routes/vault";
import {
  AnyLocalParams as AnyTagsParams,
  routePath as tagsRoutes,
} from "./routes/tags";
import { IncomingBaseParams, NoteTargetingComputedValues } from "./schemata";
import { HandlerFunction } from "./types";

export const routes: RoutePath = {
  ...rootRoutes,
  ...commandRoutes,
  ...dataviewRoutes,
  ...fileRoutes,
  ...folderRoutes,
  ...infoRoutes,
  ...notePropertiesRoutes,
  ...noteRoutes,
  ...omnisearchRoutes,
  ...periodicNoteRoutes,
  ...searchRoutes,
  ...tagsRoutes,
  ...vaultRoutes,
};

/**
 * A `RoutePath` describes a routing branch coming off from the root node (`/`).
 * It's an object with properties, each key containing a route `path` and its
 * related value is an array of object each describing a sub-path.
 *
 * Example:
 *
 *   { "daily-note": [
 *     { path: "create", schema: …, handler: … },
 *     { path: "get", schema: …, handler: … }, …
 *   ] }
 *   => builds routes `/daily-note/create` and `/daily-note/get`
 *
 * A `RouteSubpath` describes a sub-path (`path`), the Zod schema for validation
 * and a `handler` function. It defines which handler function is responsible
 * for which route path, and what data structure the function can expect.
 */
export type RoutePath = {
  [path: string]: RouteSubpath[];
};

export type RouteSubpath = {
  path: string;
  schema:
    | z.AnyZodObject
    | z.ZodDiscriminatedUnion<string, z.AnyZodObject[]>
    | z.ZodEffects<any, any, any>
    | z.ZodUnion<any>;
  handler: HandlerFunction;
};

export type AnyParams =
  | AnyCommandParams
  | AnyDataviewParams
  | AnyFileParams
  | AnyFolderParams
  | AnyInfoParams
  | AnyNoteParams
  | AnyNotePropertiesParams
  | AnyOmnisearchParams
  | AnyPeriodicNoteParams
  | AnySearchParams
  | AnyTagsParams
  | AnyVaultParams
  | IncomingBaseParams;

export type AnyProcessedParams =
  | AnyCommandParams
  | AnyDataviewParams
  | AnyFileParams
  | AnyFolderParams
  | AnyInfoParams
  | (AnyNoteParams & NoteTargetingComputedValues)
  | AnyNotePropertiesParams
  | AnyOmnisearchParams
  | AnyPeriodicNoteParams
  | AnySearchParams
  | AnyTagsParams
  | AnyVaultParams
  | IncomingBaseParams;

export enum CreateApplyParameterValue {
  Content = "content",
  Templater = "templater",
  Templates = "templates",
}

export type CreateContentParams = {
  apply: CreateApplyParameterValue.Content;
  content?: string;
};

export type CreateTemplateParams = {
  apply:
    | CreateApplyParameterValue.Templater
    | CreateApplyParameterValue.Templates;
  "template-file": TFile;
};
