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
import { helloRoute } from "../utils/routing";

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
  const { app } = window;
  const dataview = getAPI(app);

  if (!isDataviewEnabled(app) || !dataview) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.dataview_plugin_not_available,
    };
  }

  const dql = params.dql.trim() + "\n";
  if (!dql.toLowerCase().startsWith(type)) {
    return {
      isSuccess: false,
      errorCode: 400,
      errorMessage: STRINGS[`dataview_dql_must_start_with_${type}`],
    };
  }

  const res = await dataview.query(dql);
  return res.successful
    ? {
      isSuccess: true,
      result: {
        data: dqlValuesMapper(dataview, res.value.values),
      },
    }
    : {
      isSuccess: false,
      errorCode: 400,
      errorMessage: res.error,
    };
}
