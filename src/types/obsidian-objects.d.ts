import {
  App,
  CachedMetadata,
  Command,
  DataAdapter,
  MetadataCache,
  PluginManifest,
  TAbstractFile,
  TFile,
  Vault,
} from "obsidian";
import { PluginSettings } from "src/types";

export interface RealLifePlugin extends App {
  app: RealLifeApp;
  manifest: PluginManifest;
  settings: PluginSettings;
  vault: RealLifeVault;
}

export interface RealLifeApp extends App {
  commands: {
    executeCommandById(id: string): boolean;
    listCommands(): Command[];
  };
  internalPlugins: any;
  metadataCache: RealLifeMetadataCache;
  plugins: any;
  setting: {
    open: () => void;
    openTabById: (pluginName: string) => void;
  };
}

export interface RealLifeVault extends Vault {
  fileMap: Record<string, TFile>;
  config: {
    attachmentFolderPath: string;
    newFileLocation: "root" | "current" | "folder";
    newFileFolderPath: string;
  };
}

export interface RealLifeDataAdapter extends DataAdapter {
  basePath: string;
}

export interface RealLifeMetadataCache extends MetadataCache {
  getTags(): Record<string, number>;

  /**
   * The default type signature is `getFileCache(file: TFile): CachedMetadata | null;`.
   * However, I've checked the actual implementation, and the function in `app.js`
   * only accesses `file.path` – which is present in both `TFile` and `TAbstractFile`.
   *
   * *"Bold move, Cotton. Let's see if it pays off."*
   */
  getFileCache(file: TFile | TAbstractFile): CachedMetadata | null;
  fileCache: Record<string, { mtime: number; size: number; hash: string }>;
  metadataCache: Record<string, { frontmatter: Record<string, any> }>;
}
