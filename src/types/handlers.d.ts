import { Vault } from "obsidian";
import { AnyParams } from "../routes";

/**
 * A handler function is a function that is responsible for dealing with a
 * particular route. It takes a payload (i.e. the parameters from the incoming
 * `x-callback-url` call) and a vault and returns any handler result object.
 *
 * @param incomingParams - The parameters from the incoming `x-callback-url`
 * @param vault - The `Vault` instance the plugin is running in
 *
 * @returns A handler result object
 */
export type HandlerFunction = (
  incomingParams: AnyParams,
  vault: Vault,
) => Promise<AnyHandlerResult>;

type HandlerResult = {
  input: AnyParams;
  isSuccess: boolean;
};

export type HandlerFailure = HandlerResult & {
  error: string;
};

export type HandlerTextSuccess = HandlerResult & {
  result: {
    message: string;
  };
};

export type HandlerFileSuccess = HandlerResult & {
  result: {
    filepath: string;
    content: string;
  };
};

export type AnyHandlerResult =
  | HandlerTextSuccess
  | HandlerFileSuccess
  | HandlerFailure;
