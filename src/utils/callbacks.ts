import { AnyHandlerResult, HandlerFailure, HandlerSuccess } from "../types";
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
  handlerRes: HandlerSuccess | HandlerFailure,
) {
  const url = new URL(baseURL);

  const inputObj = handlerRes.input["debug-mode"]
    ? handlerRes.input
    : { "call-id": handlerRes.input["call-id"] };
  addObjectToUrlSearchParams(inputObj, url, "input");

  if (handlerRes.hasOwnProperty("error")) {
    url.searchParams.set("error", (<HandlerFailure> handlerRes).error);
  } else if (handlerRes.hasOwnProperty("result")) {
    addObjectToUrlSearchParams((<HandlerSuccess> handlerRes).result, url);
  }

  window.open(url.toString());
}

function addObjectToUrlSearchParams(
  obj: Record<string, string>,
  url: URL,
  prefix: string = XCALLBACK_RESULT_PREFIX,
) {
  for (const key in obj) {
    if (key === "x-success" || key === "x-error") {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      url.searchParams.set(`${prefix}-${key}`, obj[key]);
    }
  }
}
