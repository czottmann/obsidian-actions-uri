import { App, Workspace } from "obsidian";
import { RealLifeApp, RealLifeMetadataCache, RealLifeVault } from "../types";

const _store: Record<string, any> = {
  app: null,
};

export const obsEnv = {
  set app(app: App) {
    _store.app = app;
  },

  get app(): RealLifeApp {
    return _store.app as RealLifeApp;
  },

  get activeVault() {
    return _store.app.vault as RealLifeVault;
  },

  get activeWorkspace() {
    return _store.app.workspace as Workspace;
  },

  get metadataCache() {
    return _store.app.metadataCache as RealLifeMetadataCache;
  },
};
