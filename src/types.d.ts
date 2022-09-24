import { Vault } from "obsidian";
import { AnyZodObject } from "zod";

export type ZodSafeParseSuccessData = Record<string, any>;

export type Result = {
  success: boolean;
  error?: string;
  result?: any;
};

export type Route = {
  path: string | string[];
  schema: AnyZodObject;
  handler: (
    data: ZodSafeParseSuccessData,
    vault: Vault,
  ) => Promise<AnyHandlerResult>;
};

interface HandlerResult {
  input: ZodSafeParseSuccessData;
  success: boolean;
}

export interface HandlerSuccess extends HandlerResult {
  data: Record<string, string>;
}

export interface HandlerFailure extends HandlerResult {
  error: string;
}

export interface HandlerTextSuccess extends HandlerSuccess {
  data: {
    result: string;
  };
}

export interface HandlerFileSuccess extends HandlerSuccess {
  data: {
    file: string;
    content: string;
  };
}

export type AnyHandlerResult =
  | HandlerTextSuccess
  | HandlerFileSuccess
  | HandlerFailure;
