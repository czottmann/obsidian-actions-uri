import { z } from "zod";
import { STRINGS } from "src/constants";
import { AnyParams, RoutePath } from "src/routes";
import { incomingBaseParams } from "src/schemata";
import {
  HandlerCommandsExecutionSuccess,
  HandlerCommandsSuccess,
  HandlerFailure,
  RealLifePlugin,
} from "src/types";
import { failure, success } from "src/utils/results-handling";
import { helloRoute } from "src/utils/routing";
import { pause } from "src/utils/time";
import { zodAlwaysFalse, zodCommaSeparatedStrings } from "src/utils/zod";

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
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerCommandsSuccess | HandlerFailure> {
  const commands = this.app.commands
    .listCommands()
    .map((cmd) => ({ id: cmd.id, name: cmd.name }));

  return success({ commands: JSON.stringify(commands) });
}

async function handleExecute(
  this: RealLifePlugin,
  incomingParams: AnyParams,
): Promise<HandlerCommandsExecutionSuccess | HandlerFailure> {
  const params = <ExecuteParams> incomingParams;
  const { commands } = params;
  const pauseInMilliseconds = (params["pause-in-secs"] || 0.2) * 1000;

  for (let idx = 0; idx < commands.length; idx++) {
    const cmd = commands[idx];
    const wasSuccess = this.app.commands.executeCommandById(cmd);

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
