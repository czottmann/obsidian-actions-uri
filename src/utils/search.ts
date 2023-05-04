import { TFile } from "obsidian";
import { getEnabledCommunityPlugin, getEnabledCorePlugin } from "./plugins";
import { pause } from "./time";
import { STRINGS } from "../constants";
import { OmnisearchAPI, SearchResultObject } from "../types";

/**
 * Executes a global search for the specified query and returns the search
 * results (= file paths) as a `SearchResultObject`.
 *
 * @param {string} query The search query string.
 */
export async function doSearch(query: string): Promise<SearchResultObject> {
  // Get the global search plugin instance
  const res = getEnabledCorePlugin("global-search");

  // If the plugin instance is not available, return an error response
  if (!res.isSuccess) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.global_search_feature_not_available,
    };
  }

  // Open the global search panel and wait for it to load
  const pluginInstance = res.result;
  pluginInstance.openGlobalSearch(query);
  const searchLeaf = window.app.workspace.getLeavesOfType("search")[0];
  const searchView = await searchLeaf.open(searchLeaf.view);
  await pause(2000);

  // Extract the search result hits
  const rawSearchResult: Map<TFile, any> =
    (<any> searchView).dom.resultDomLookup;
  const hits = Array.from(rawSearchResult.keys()).map((tfile) => tfile.path);

  // Return the search result as a `SearchResultObject`
  return {
    isSuccess: true,
    result: { hits },
  };
}

/**
 * Executes an Omnisearch …search for the specified query and returns the
 * results (= file paths) as a `SearchResultObject`.
 *
 * @param {string} query The search query string.
 */
export async function doOmnisearch(query: string): Promise<SearchResultObject> {
  // Get the Omnisearch plugin instance or back off
  const res = getEnabledCommunityPlugin("omnisearch");
  if (!res.isSuccess) {
    return {
      isSuccess: false,
      errorCode: 412,
      errorMessage: STRINGS.omnisearch_plugin_not_available,
    };
  }

  // Execute the Omnisearch query
  const plugin = <OmnisearchAPI> res.result.api;
  const results = await plugin.search(query);
  const hits = results.map((result) => result.path);

  // Return the search result as a `SearchResultObject`
  return {
    isSuccess: true,
    result: { hits },
  };
}
