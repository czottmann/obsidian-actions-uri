import { Vault } from "obsidian";
import { AnyZodObject } from "zod";

export type ZodSafeParsedData = Record<string, any>;

export type SimpleResult = {
  isSuccess: false;
  error: string;
} | {
  isSuccess: true;
  result: string;
};

export type RegexResult = {
  isSuccess: false;
  error: string;
} | {
  isSuccess: true;
  result: RegExp;
};

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
  incomingParams: ZodSafeParsedData,
  vault: Vault,
) => Promise<AnyHandlerResult>;

/**
 * A `Route` defines which handler function is responsible for which route path,
 * and what data structure the function can expect.
 */
export type Route = {
  path: string;
  schema: AnyZodObject;
  handler: HandlerFunction;
};

interface HandlerResult {
  input: ZodSafeParsedData;
  isSuccess: boolean;
}

export interface HandlerSuccess extends HandlerResult {
  result: Record<string, string>;
}

export interface HandlerFailure extends HandlerResult {
  error: string;
}

export interface HandlerTextSuccess extends HandlerSuccess {
  result: {
    message: string;
  };
}

export interface HandlerFileSuccess extends HandlerSuccess {
  result: {
    file: string;
    content: string;
  };
}

export type AnyHandlerResult =
  | HandlerTextSuccess
  | HandlerFileSuccess
  | HandlerFailure;
