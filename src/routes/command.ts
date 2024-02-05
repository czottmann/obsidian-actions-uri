import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerCommandsExecutionSuccess,
  HandlerCommandsSuccess,
  HandlerFailure,
  RealLifeApp,
} from "../types";
import { failure, success } from "../utils/results-handling";
import { helloRoute } from "../utils/routing";
import { pause } from "../utils/time";
import { zodAlwaysFalse, zodCommaSeparatedStrings } from "../utils/zod";

// SCHEMATA ----------------------------------------

const listParams = incomingBaseParams.extend({
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ListParams = z.infer<typeof listParams>;

const executeParams = incomingBaseParams.extend({
  commands: zodCommaSeparatedStrings,
  "pause-in-secs": z.coerce.number().optional(),
  silent: zodAlwaysFalse,
});
type ExecuteParams = z.infer<typeof executeParams>;

export type AnyLocalParams =
  | ListParams
  | ExecuteParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/command": [
    helloRoute(),
    { path: "/list", schema: listParams, handler: handleList },
    {
      path: "/execute",
      schema: executeParams,
      handler: handleExecute,
    },
  ],
};

// HANDLERS ----------------------------------------

async function handleList(
  incomingParams: AnyParams,
): Promise<HandlerCommandsSuccess | HandlerFailure> {
  const commands = (<RealLifeApp> window.app).commands
    .listCommands()
    .map((cmd) => ({ id: cmd.id, name: cmd.name }));

  return success({ commands: JSON.stringify(commands) });
}

async function handleExecute(
  incomingParams: AnyParams,
): Promise<HandlerCommandsExecutionSuccess | HandlerFailure> {
  const params = <ExecuteParams> incomingParams;
  const { commands } = params;
  const pauseInMilliseconds = (params["pause-in-secs"] || 0.2) * 1000;

  for (let idx = 0; idx < commands.length; idx++) {
    const cmd = commands[idx];
    const wasSuccess = (<RealLifeApp> window.app).commands
      .executeCommandById(cmd);

    // If this call wasn't successful, stop the sequence and return an error.
    if (!wasSuccess) {
      return failure(500, STRINGS.command_not_found(cmd));
    }

    // Unless this was the last command of the sequence, put in a short pause.
    if (idx < commands.length - 1) {
      await pause(pauseInMilliseconds);
    }
  }

  return success({});
}
