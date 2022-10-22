import { AnyParams, RouteSubpath } from "../routes";
import { incomingBaseParams } from "../schemata";
import { HandlerTextSuccess } from "../types";
import { showBrandedNotice } from "./ui";

export function helloRoute(path: string = "/"): RouteSubpath {
  return { path, schema: incomingBaseParams.extend({}), handler: handleHello };
}

async function handleHello(data: AnyParams): Promise<HandlerTextSuccess> {
  showBrandedNotice("… is ready for action 🚀");
  return { isSuccess: true, result: { message: "" } };
}
