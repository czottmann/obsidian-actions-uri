import { Vault } from "obsidian";
import { z } from "zod";
import { basePayload } from "../schemata";
import {
  AnyHandlerResult,
  HandlerTextSuccess,
  Route,
  ZodSafeParsedData,
} from "../types";
import { showBrandedNotice } from "./grabbag";

export function helloRoute(path: string): Route {
  return {
    path,
    schema: z.object({}),
    handler: handleHello,
  };
}

async function handleHello(
  data: ZodSafeParsedData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  showBrandedNotice("… is ready for action 🚀");

  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: data as z.infer<typeof basePayload>,
  };
}
