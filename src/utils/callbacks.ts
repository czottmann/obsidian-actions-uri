import { excludeKeys, includeKeys } from "filter-obj";
import { XCALLBACK_RESULT_PREFIX } from "../constants";
import { AnyParams } from "../routes";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerTextSuccess,
  StringResultObject,
} from "../types";
/**
 * @param baseURL - The base `x-callback-url` of the receiver, e.g.
 * "another-app://", "another-app://x-callback-url/success" or
 * "another-app://success"
 * @param handlerRes - Any route handler result object
 *
 * @returns A `StringResultObject` with the `result` property set to the called
 * URL
 *
 * @see {@link AnyHandlerResult}
 */
export function sendUrlCallback(
  baseURL: string,
  handlerRes: AnyHandlerResult,
  params: AnyParams,
): StringResultObject {
  const url = new URL(baseURL);

  if (handlerRes.isSuccess) {
    addObjectToUrlSearchParams((<HandlerTextSuccess> handlerRes).result, url);
  } else {
    url.searchParams.set("error", (<HandlerFailure> handlerRes).error);
  }

  const returnParams: Record<string, string> = params["debug-mode"]
    ? excludeKeys(params, ["debug-mode", "x-success", "x-error"])
    : includeKeys(params, ["call-id"]);
  addObjectToUrlSearchParams(returnParams, url, "input");

  window.open(url.toString());

  return <StringResultObject> {
    isSuccess: true,
    result: url.toString(),
  };
}

function addObjectToUrlSearchParams(
  obj: Record<string, string>,
  url: URL,
  prefix: string = XCALLBACK_RESULT_PREFIX,
) {
  const sortedKeys = Object.keys(obj).sort();
  for (const key of sortedKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      url.searchParams.set(`${prefix}-${key}`, obj[key]);
    }
  }
}
