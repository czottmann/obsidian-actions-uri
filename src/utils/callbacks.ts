import { ObsidianProtocolData, requestUrl, TAbstractFile } from "obsidian";
import { excludeKeys } from "filter-obj";
import { XCALLBACK_RESULT_PREFIX } from "src/constants";
import { PLUGIN_INFO } from "src/plugin-info";
import { AnyParams } from "src/routes";
import {
  AnyHandlerResult,
  AnyHandlerSuccess,
  HandlerFailure,
  StringResultObject,
} from "src/types";
import { success } from "src/utils/results-handling";
import { toKebabCase } from "src/utils/string-handling";

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
  params: AnyParams | ObsidianProtocolData,
): StringResultObject {
  const url = new URL(baseURL);

  if (handlerRes.isSuccess) {
    addObjectToUrlSearchParams((<AnyHandlerSuccess> handlerRes).result, url);
  } else {
    const { errorCode, errorMessage } = <HandlerFailure> handlerRes;
    url.searchParams.set("errorCode", errorCode.toString());
    url.searchParams.set("errorMessage", errorMessage);
  }

  if (params["x-source"] && /actions for obsidian/i.test(params["x-source"])) {
    url.searchParams.set("pv", PLUGIN_INFO.pluginVersion);
  }

  const returnParams: Record<string, string> = params["debug-mode"]
    ? excludeKeys(<any> params, [
      "debug-mode",
      "x-success",
      "x-error",
      "_computed",
    ])
    : {};
  addObjectToUrlSearchParams(returnParams, url, "input");

  const callbackURL = url.toString().replace(/\+/g, "%20");
  sendCallbackResult(callbackURL);

  return success(callbackURL);
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
  obj: Record<string, any>,
  url: URL,
  prefix: string = XCALLBACK_RESULT_PREFIX,
) {
  const sortedKeys = Object.keys(obj).sort();
  for (const key of sortedKeys) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    let val: string | undefined;
    if (typeof obj[key] === "string") {
      val = <string> obj[key];
    } else if (obj[key] instanceof TAbstractFile) {
      val = (<TAbstractFile> obj[key]).path;
    } else if (typeof obj[key] !== "undefined") {
      val = JSON.stringify(obj[key]);
    }

    if (val === undefined) continue;

    url.searchParams.set(toKebabCase(`${prefix}-${key}`), val);
  }
}

/**
 * Sends a XCU callback, i.e. makes a request to the given URI.
 *
 * If the URL is a HTTP/HTTPS one, it is assumed the callback is slated for the
 * HTTP server of the testing setup, and Obsidian's own `requestUrl()` is used.
 *
 * In production mode (outside testing) the URI is passed to the OS using
 * `window.open()`, which passes them to the registered apps. (In testing, we
 * use a HTTP server, and `window.open()` would have the OS pass the URI to the
 * default browser, which is not what we want.)
 *
 * @param uri - The URI to call
 */
function sendCallbackResult(uri: string) {
  if (/^https?:\/\//.test(uri)) {
    requestUrl(uri);
  } else {
    window.open(uri);
  }
}
