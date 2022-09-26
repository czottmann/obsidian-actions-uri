import { excludeKeys, includeKeys } from "filter-obj";
import { AnyHandlerResult, HandlerFailure, HandlerTextSuccess } from "../types";
import { XCALLBACK_RESULT_PREFIX } from "../constants";

/**
 * @param baseURL - The base `x-callback-url` of the receiver, e.g.
 * "another-app://", "another-app://x-callback-url/success" or
 * "another-app://success"
 * @param handlerRes - Any route handler result object
 *
 * @see {@link AnyHandlerResult}
 */
export function sendUrlCallback(
  baseURL: string,
  handlerRes: AnyHandlerResult,
) {
  const url = new URL(baseURL);

  if (handlerRes.isSuccess) {
    addObjectToUrlSearchParams((<HandlerTextSuccess> handlerRes).result, url);
  } else {
    url.searchParams.set("error", (<HandlerFailure> handlerRes).error);
  }

  const inputObj: Record<string, string> = handlerRes.input["debug-mode"]
    ? excludeKeys(handlerRes.input, ["debug-mode", "x-success", "x-error"])
    : includeKeys(handlerRes.input, ["call-id"]);
  addObjectToUrlSearchParams(inputObj, url, "input");

  window.open(url.toString());
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
