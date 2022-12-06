import { DataAdapter, Vault } from "obsidian";

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
