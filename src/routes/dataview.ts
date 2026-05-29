import {
  DataviewApi,
  getAPI,
  isPluginEnabled as isDataviewEnabled,
  Literal,
} from "obsidian-dataview";
import { z } from "zod";
import { STRINGS } from "src/constants";
import { RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  DataviewQueryData,
  HandlerDataviewSuccess,
  HandlerFailure,
  RealLifePlugin,
} from "src/types";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";

/* eslint-disable @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-return,
   @typescript-eslint/no-unsafe-argument --
   obsidian-dataview's published .d.ts files use non-relative internal module
   specifiers (e.g. "data-model/value", "api/result") that don't resolve under
   this project's tsconfig, so the type-checker degrades DataviewApi/Literal and
   the query-result types to unresolved/`any`. skipLibCheck hides this from the
   build. The values we touch are typed as far as the upstream types allow
   (Literal, DataviewQueryData); the residual no-unsafe findings are unavoidable
   until the dataview types resolve cleanly. */

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

function dqlValuesMapper(dataview: DataviewApi, v: Literal): DataviewQueryData {
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

  const queryResult = res.value;

  // For some TABLE queries, DV will return a three-dimensional array instead of
  // a two-dimensional one. Not sure what's the cause but I'll need to account
  // for this. (https://github.com/czottmann/obsidian-actions-uri/issues/79)
  if (queryResult.type === "table") {
    const values = queryResult.values;
    return (getArrayDimensions(values) > 2)
      ? success({ data: dqlValuesMapper(dataview, values[0]) })
      : success({ data: dqlValuesMapper(dataview, values) });
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
  if (queryResult.type === "list") {
    const normalized = queryResult.values
      .map((v: Literal) => Array.isArray(v) ? v : [v]);
    // Mapping an array through dqlValuesMapper yields an array (one entry per
    // row); join each row into a string.
    const mapped = dqlValuesMapper(dataview, normalized) as DataviewQueryData[];
    return success({
      data: mapped.map((v) => Array.isArray(v) ? v.join(", ") : v),
    });
  }

  return failure(ErrorCode.invalidInput, "Neither LIST nor TABLE query");
}

function getArrayDimensions(input: unknown[]) {
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
