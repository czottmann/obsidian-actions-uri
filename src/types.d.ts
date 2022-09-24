import { Vault } from "obsidian";
import { AnyZodObject } from "zod";

export type Route = {
  path: string | string[];
  schema: AnyZodObject;
  handler: (data: ZodSafeParseSuccessData, vault: Vault) => Promise<AnyResult>;
};

export type ZodSafeParseSuccessData = Record<string, any>;

interface Result {
  input: ZodSafeParseSuccessData;
  success: boolean;
}

export interface SuccessfulResult extends Result {
  data: Record<string, string>;
}

export interface UnsuccessfulResult extends Result {
  error: string;
}

export interface SuccessfulStringResult extends SuccessfulResult {
  data: {
    result: string;
  };
}

export interface SuccessfulFileResult extends SuccessfulResult {
  data: {
    file: string;
    content: string;
  };
}

export type AnyResult =
  | SuccessfulStringResult
  | SuccessfulFileResult
  | UnsuccessfulResult;
