import {
  DataviewApi,
  getAPI,
  isPluginEnabled as isDataviewEnabled,
} from "obsidian-dataview";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerDataviewSuccess,
  HandlerFailure,
  RealLifePlugin,
} from "src/types";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

// SCHEMATA ----------------------------------------

const readParams = incomingBaseParams.extend({
  "dql": z.string(),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

// TYPES ----------------------------------------

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
  this: RealLifePlugin,
  params: ReadParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  return await executeDataviewQuery.bind(this)("table", params);
}

async function handleListQuery(
  this: RealLifePlugin,
  params: ReadParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  return await executeDataviewQuery.bind(this)("list", params);
}

// HELPERS ----------------------------------------

function dqlValuesMapper(dataview: DataviewApi, v: any): any {
  return Array.isArray(v)
    ? v.map((v1) => dqlValuesMapper(dataview, v1))
    : dataview.value.toString(v);
}

async function executeDataviewQuery(
  this: RealLifePlugin,
  type: "table" | "list",
  params: ReadParams,
): Promise<HandlerDataviewSuccess | HandlerFailure> {
  const dataview = getAPI(this.app);

  if (!isDataviewEnabled(this.app) || !dataview) {
    return failure(
      ErrorCode.featureUnavailable,
      STRINGS.dataview_plugin_not_available,
    );
  }

  const dql = params.dql.trim() + "\n";
  if (!dql.toLowerCase().startsWith(type)) {
    return failure(
      ErrorCode.invalidInput,
      STRINGS[`dataview_dql_must_start_with_${type}`],
    );
  }

  const res = await dataview.query(dql);
  if (!res.successful) {
    return failure(ErrorCode.unknownError, res.error);
  }

  // For some TABLE queries, DV will return a three-dimensional array instead of
  // a two-dimensional one. Not sure what's the cause but I'll need to account
  // for this. (https://github.com/czottmann/obsidian-actions-uri/issues/79)
  if (type === "table") {
    return (getArrayDimensions(res.value.values) > 2)
      ? success({ data: dqlValuesMapper(dataview, res.value.values[0]) })
      : success({ data: dqlValuesMapper(dataview, res.value.values) });
  }

  // For LIST queries, DV will return a two-dimensional array instead of a one-
  // dimensional one *if* one of the queried files returns more than one hit.
  // This is inconsistent, and AFO will nope out. So we'll need to make it
  // consistent before rendering out the result.
  //
  // Example: If you query for an inline field (`whatever::`), and one file
  // contains two of this field, e.g. `whatever:: something 1` and
  // `whatever:: something 2`, while another file contains just one
  // (e.g., `whatever:: something 3`), DV will return:
  //
  //     [
  //       ["something 1", "something 2"],
  //       "something 3"
  //     ]
  if (type === "list") {
    res.value.values = res.value.values
      .map((v: any) => Array.isArray(v) ? v : [v]);
    return success({
      data: dqlValuesMapper(dataview, res.value.values)
        .map((v: any) => v.join(", ")),
    });
  }

  return failure(ErrorCode.invalidInput, "Neither LIST nor TABLE query");
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
