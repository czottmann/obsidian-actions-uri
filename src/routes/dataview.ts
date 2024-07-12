import {
  DataviewApi,
  getAPI,
  isPluginEnabled as isDataviewEnabled,
} from "obsidian-dataview";
import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerDataviewSuccess, HandlerFailure } from "../types";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";
import { self } from "../utils/self";

// SCHEMATA ----------------------------------------

const readParams = incomingBaseParams.extend({
  "dql": z.string(),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

export type AnyLocalParams = ReadParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/dataview": [
    helloRoute(),
    { path: "/table-query", schema: readParams, handler: handleTableQuery },
    { path: "/list-query", schema: readParams, handler: handleListQuery },
    // { path: "/task-query", schema: readParams, handler: handleTaskQuery },
  ],
};

// HANDLERS ----------------------------------------

async function handleTableQuery(
  incomingParams: AnyParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  return await handleDataviewQuery("table", incomingParams);
}

async function handleListQuery(
  incomingParams: AnyParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  return await handleDataviewQuery("list", incomingParams);
}

// HELPERS ----------------------------------------

function dqlValuesMapper(dataview: DataviewApi, v: any): any {
  return Array.isArray(v)
    ? v.map((v1) => dqlValuesMapper(dataview, v1))
    : dataview.value.toString(v);
}

async function handleDataviewQuery(
  type: "table" | "list",
  incomingParams: AnyParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  const params = <ReadParams> incomingParams;
  const dataview = getAPI(self().app);

  if (!isDataviewEnabled(self().app) || !dataview) {
    return failure(412, STRINGS.dataview_plugin_not_available);
  }

  const dql = params.dql.trim() + "\n";
  if (!dql.toLowerCase().startsWith(type)) {
    return failure(400, STRINGS[`dataview_dql_must_start_with_${type}`]);
  }

  const res = await dataview.query(dql);
  if (!res.successful) {
    return failure(400, res.error);
  }

  // For some TABLE queries, DV will return a three-dimensional array instead of
  // a two-dimensional one. Not sure what's the cause but I'll need to account
  // for this. (https://github.com/czottmann/obsidian-actions-uri/issues/79)
  if (type === "table" && getArrayDimensions(res.value.values) > 2) {
    return success({ data: dqlValuesMapper(dataview, res.value.values[0]) });
  }

  return success({ data: dqlValuesMapper(dataview, res.value.values) });
}

function getArrayDimensions(input: any[]) {
  if (!Array.isArray(input)) {
    return 0;
  }

  let dimensions = 1;
  input.forEach((item) => {
    if (Array.isArray(item)) {
      dimensions = Math.max(dimensions, getArrayDimensions(item) + 1);
    }
  });

  return dimensions;
}
