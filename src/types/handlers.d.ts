import { AnyParams } from "../routes";

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
};

type HandlerSuccess =
  & HandlerResult
  & { processedFilepath?: string };

export type HandlerFailure = Readonly<
  & HandlerResult
  & { error: string }
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
      "front-matter"?: string;
    };
  }
>;

export type AnyHandlerResult =
  | HandlerTextSuccess
  | HandlerFileSuccess
  | HandlerFailure;
