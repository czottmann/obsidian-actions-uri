import { Vault } from "obsidian";
import { AnyZodObject } from "zod";

export type ZodSafeParsedData = Record<string, any>;

export type Result = {
  success: false;
  error: string;
} | {
  success: true;
  result: any;
};

export type Route = {
  path: string | string[];
  schema: AnyZodObject;
  handler: (
    data: ZodSafeParsedData,
    vault: Vault,
  ) => Promise<AnyHandlerResult>;
};

interface HandlerResult {
  input: ZodSafeParsedData;
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
