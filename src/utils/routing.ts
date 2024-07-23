import { success } from "src/utils/results-handling";
import { AnyParams, RouteSubpath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import { HandlerTextSuccess } from "src/types";
import { showBrandedNotice } from "src/utils/ui";

export function helloRoute(path: string = "/"): RouteSubpath {
  return { path, schema: incomingBaseParams.extend({}), handler: handleHello };
}

async function handleHello(data: AnyParams): Promise<HandlerTextSuccess> {
  showBrandedNotice("… is ready for action 🚀");
  return success({ message: "Hello!" });
}
