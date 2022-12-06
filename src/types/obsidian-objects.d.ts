import { DataAdapter, MetadataCache, Vault } from "obsidian";

export interface RealLifeVault extends Vault {
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
}
