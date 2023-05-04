// Source: https://publish.obsidian.md/omnisearch/Public+API+%26+URL+Scheme
export type OmnisearchAPI = {
  // Returns a promise that will contain the same results as the Vault modal
  search: (query: string) => Promise<OmnisearchResultNoteApi[]>;
  // Refreshes the index
  refreshIndex: () => Promise<void>;
  // Register a callback that will be called when the indexing is done
  registerOnIndexed: (callback: () => void) => void;
  // Unregister a callback that was previously registered
  unregisterOnIndexed: (callback: () => void) => void;
};

type OmnisearchResultNoteApi = {
  score: number;
  path: string;
  basename: string;
  foundWords: string[];
  matches: OmnisearchSearchMatchApi[];
};

type OmnisearchSearchMatchApi = {
  match: string;
  offset: number;
};
