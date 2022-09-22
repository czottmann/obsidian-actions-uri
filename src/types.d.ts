import { AnyZodObject } from "zod";

export type Route = {
  path: string | string[];
  schema: AnyZodObject;
  handler: (data: ZodSafeParseSuccessData) => void;
};

export type ZodSafeParseSuccessData = {
  [x: string]: any;
};
