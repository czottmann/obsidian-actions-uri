import { TFile } from "obsidian";
import {
  getEnabledCommunityPlugin,
  getEnabledCorePlugin,
} from "src/utils/plugins";
import { pause } from "src/utils/time";
import { STRINGS } from "src/constants";
import { OmnisearchAPI, SearchResultObject } from "src/types";
import { self } from "src/utils/self";
import { ErrorCode, failure, success } from "src/utils/results-handling";

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
    return failure(
      ErrorCode.featureUnavailable,
      STRINGS.global_search_feature_not_available,
    );
  }

  // Open the global search panel and wait for it to load
  const pluginInstance = res.result;
  pluginInstance.openGlobalSearch(query);
  const searchLeaf = self().app.workspace.getLeavesOfType("search")[0];
  const searchView = await searchLeaf.open(searchLeaf.view);
  await pause(2000);

  // Extract the search result hits
  const rawSearchResult: Map<TFile, any> =
    (<any> searchView).dom.resultDomLookup;
  const hits = Array.from(rawSearchResult.keys()).map((tfile) => tfile.path);

  // Return the search result as a `SearchResultObject`
  return success({ hits });
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
    return failure(
      ErrorCode.featureUnavailable,
      STRINGS.omnisearch_plugin_not_available,
    );
  }

  // Execute the Omnisearch query
  const plugin = <OmnisearchAPI> res.result.api;
  const results = await plugin.search(query);
  const hits = results.map((result) => result.path);

  // Return the search result as a `SearchResultObject`
  return success({ hits });
}
