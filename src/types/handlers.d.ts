import { AnyProcessedParams } from "../routes";

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
  incomingParams: AnyProcessedParams,
) => Promise<AnyHandlerResult>;

type HandlerResult = {
  isSuccess: boolean;
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
      properties?: NoteProperties;
    };
  }
>;
export type HandlerFilePathSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      filepath: string;
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

export type HandlerCommandsSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      commands: string;
    };
  }
>;

export type HandlerCommandsExecutionSuccess = Readonly<
  & HandlerSuccess
  & { result: {} }
>;

export type HandlerPropertiesSuccess = Readonly<
  & HandlerSuccess
  & {
    result: {
      properties: NoteProperties;
    };
  }
>;

export type NoteProperties = Record<
  string,
  string | string[] | number | boolean | null
>;

export type AnyHandlerSuccess =
  | HandlerCommandsExecutionSuccess
  | HandlerCommandsSuccess
  | HandlerDataviewSuccess
  | HandlerFileSuccess
  | HandlerFilePathSuccess
  | HandlerInfoSuccess
  | HandlerPathsSuccess
  | HandlerPropertiesSuccess
  | HandlerSearchSuccess
  | HandlerTextSuccess
  | HandlerVaultSuccess;

export type AnyHandlerResult =
  | AnyHandlerSuccess
  | HandlerFailure;
