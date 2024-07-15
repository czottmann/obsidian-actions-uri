import {
  App,
  Command,
  DataAdapter,
  MetadataCache,
  TFile,
  Vault,
} from "obsidian";

export interface RealLifeApp extends App {
  commands: {
    executeCommandById(id: string): boolean;
    listCommands(): Command[];
  };
  internalPlugins: any;
  metadataCache: RealLifeMetadataCache;
  plugins: any;
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
  fileCache: Record<string, { mtime: number; size: number; hash: string }>;
  metadataCache: Record<string, { frontmatter: Record<string, any> }>;
}
