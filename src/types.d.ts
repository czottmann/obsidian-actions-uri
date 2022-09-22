import { Vault } from "obsidian";
import { AnyZodObject } from "zod";

export type Route = {
  path: string | string[];
  schema: AnyZodObject;
  handler: (data: ZodSafeParseSuccessData, vault: Vault) => void;
};

export type ZodSafeParseSuccessData = {
  [x: string]: any;
};
