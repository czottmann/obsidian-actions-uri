import { TFile } from "obsidian";
import { getEnabledCorePlugin } from "./plugins";
import { SearchResultObject } from "../types";
import { STRINGS } from "../constants";

export async function doSearch(query: string): Promise<SearchResultObject> {
  const { app } = global;
  const res = getEnabledCorePlugin("global-search");

  if (!res.isSuccess) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.global_search_feature_not_available,
    };
  }

  const pluginInstance = res.result;
  pluginInstance.openGlobalSearch(query);

  const searchLeaf = app.workspace.getLeavesOfType("search")[0];
  const searchView = await searchLeaf.open(searchLeaf.view);
  const rawSearchResult: Map<TFile, any> = await new Promise((resolve) =>
    // The search needs a bit of time to complete, so we wait for it to finish.
    // Easier (and dirtier…) than observing the DOM structure for changes.
    setTimeout(() => resolve((<any> searchView).dom.resultDomLookup), 2000)
  );
  const hits = Array.from(rawSearchResult.keys()).map((tfile) => tfile.path);

  return {
    isSuccess: true,
    result: { hits },
  };
}

// NOTES --------------------

/**
 * const isDailyNotesSearch = params.action.endsWith("/daily-notes");
 * const dnSettings = getDailyNoteSettings();
 * // → { "format": "[Journal] YYYY-MM-DD", "folder": "folder", "template": "" }
 */
