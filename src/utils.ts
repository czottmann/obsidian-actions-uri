import { Notice } from "obsidian";
import { SuccessfulResult, UnsuccessfulResult } from "./types";

export function showBrandedNotice(msg: string) {
  new Notice(`[Actions URI] ${msg}`);
}

export function sendUrlCallback(
  baseURL: string,
  result: SuccessfulResult | UnsuccessfulResult,
) {
  const url = new URL(baseURL);
  addObjectToUrlSearchParams(result.input, url, "input");

  if (result.hasOwnProperty("error")) {
    url.searchParams.set("error", (<UnsuccessfulResult> result).error);
  } else if (result.hasOwnProperty("data")) {
    addObjectToUrlSearchParams((<SuccessfulResult> result).data, url);
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
