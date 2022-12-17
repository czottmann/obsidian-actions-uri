import { AnyParams } from "../routes";
import { AbstractFile } from "../types";

/**
 * A handler function is a function that is responsible for dealing with a
 * particular route. It takes a payload (i.e. the parameters from the incoming
 * `x-callback-url` call) and a vault and returns any handler result object.
 *
 * @param incomingParams - The parameters from the incoming `x-callback-url`
 *
 * @returns A handler result object
 */
export type HandlerFunction = (
  incomingParams: AnyParams,
) => Promise<AnyHandlerResult>;

type HandlerResult = {
  isSuccess: boolean;

  // Plugin version
  pv?: string;
};

type HandlerSuccess =
  & HandlerResult
  & { processedFilepath?: string };

export type HandlerFailure = Readonly<
  & HandlerResult
  & {
    errorCode: number;
    errorMessage: string;
  }
>;

export type HandlerTextSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      message: string;
    };
  }
>;

export type HandlerFileSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      content: string;
      filepath: string;
      body?: string;
      frontMatter?: string;
    };
  }
>;

export type HandlerDataviewSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      data: string;
    };
  }
>;

export type HandlerPathsSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      paths: string[];
    };
  }
>;

export type HandlerSearchSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      hits: string[];
    };
  }
>;

export type HandlerTagsSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      tags: string[];
    };
  }
>;

export type HandlerInfoSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      pluginVersion: string;
      pluginReleasedAt: string;
      apiVersion: string;
      nodeVersion: string;
      os: string;
      platform: string;
    };
  }
>;

export type HandlerVaultSuccess = Readonly<
  & HandlerSuccess
  & { result: {} }
>;

export type HandlerVaultInfoSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      basePath: string;
      attachmentFolderPath: string;
      newFileFolderPath: string;
    };
  }
>;

export type AnyHandlerSuccess =
  | HandlerDataviewSuccess
  | HandlerFileSuccess
  | HandlerInfoSuccess
  | HandlerPathsSuccess
  | HandlerSearchSuccess
  | HandlerTextSuccess
  | HandlerVaultSuccess;

export type AnyHandlerResult =
  | AnyHandlerSuccess
  | HandlerFailure;
