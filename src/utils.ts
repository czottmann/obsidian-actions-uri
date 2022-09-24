import { Notice } from "obsidian";
import { AnyHandlerResult, HandlerFailure, HandlerSuccess } from "./types";

/**
 * Displays a `Notice` inside Obsidian. The notice is prefixed with
 * "[Actions URI]" so the sender is clear to the receiving user.
 *
 * @param msg - The message to be shown in the notice
 */
export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}

/**
 * @param baseURL - The base `x-callback-url` of the receiver, e.g.
 * "another-app://", "another-app://x-callback-url/success" or
 * "another-app://success"
 * @param result - Any route handler result object
 *
 * @see {@link AnyHandlerResult}
 */
export function sendUrlCallback(
  baseURL: string,
  result: HandlerSuccess | HandlerFailure,
) {
  const url = new URL(baseURL);
  addObjectToUrlSearchParams(result.input, url, "input");

  if (result.hasOwnProperty("error")) {
    url.searchParams.set("error", (<HandlerFailure> result).error);
  } else if (result.hasOwnProperty("data")) {
    addObjectToUrlSearchParams((<HandlerSuccess> result).data, url);
  }

  window.open(url.toString());
}

function addObjectToUrlSearchParams(
  data: Record<string, string>,
  url: URL,
  prefix: string = "data",
) {
  for (const key in data) {
    if (key === "x-success" || key === "x-error") {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      url.searchParams.set(`${prefix}-${key}`, value);
    }
  }
}
