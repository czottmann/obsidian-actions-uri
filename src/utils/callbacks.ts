import { excludeKeys, includeKeys } from "filter-obj";
import { XCALLBACK_RESULT_PREFIX } from "../constants";
import { AnyParams } from "../routes";
import { toKebabCase } from "./string-handling";
import {
  AnyHandlerResult,
  AnyHandlerSuccess,
  HandlerFailure,
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
    addObjectToUrlSearchParams(
      (<AnyHandlerSuccess> handlerRes).result,
      url,
    );
  } else {
    const { errorCode, errorMessage } = <HandlerFailure> handlerRes;
    url.searchParams.set("errorCode", errorCode.toString());
    url.searchParams.set("errorMessage", errorMessage);
  }

  const returnParams: Record<string, string> = params["debug-mode"]
    ? excludeKeys(params, ["debug-mode", "x-success", "x-error"])
    : includeKeys(params, ["call-id"]);
  addObjectToUrlSearchParams(returnParams, url, "input");

  const callbackURL = url.toString().replace(/\+/g, "%20");
  window.open(callbackURL);

  return <StringResultObject> {
    isSuccess: true,
    result: callbackURL,
  };
}

/**
 * Adds properties of an object as search params to a `URL` instance. The keys
 * of the object will be normalized to kebab case.
 *
 * @param obj - An object whose properties are to be added an `URL` object as
 * search parameters
 * @param url - The `URL` target object
 * @param prefix - An optional prefix to be added to the parameter names,
 * defaults to `XCALLBACK_RESULT_PREFIX`
 */
function addObjectToUrlSearchParams(
  obj: Record<string, string | string[]>,
  url: URL,
  prefix: string = XCALLBACK_RESULT_PREFIX,
) {
  const sortedKeys = Object.keys(obj).sort();
  for (const key of sortedKeys) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const val = (typeof obj[key] === "string")
      ? <string> obj[key]
      : JSON.stringify(obj[key]);

    url.searchParams.set(
      toKebabCase(`${prefix}-${key}`),
      val,
    );
  }
}
