import {
  normalizePath,
  ObsidianProtocolData,
  Plugin,
  TAbstractFile,
} from "obsidian";
import { z, ZodError } from "zod";
import { STRINGS, URI_NAMESPACE } from "src/constants";
import { AnyParams, RoutePath, routes } from "src/routes";
import { SettingsTab } from "src/settings";
import {
  AnyHandlerResult,
  AnyHandlerSuccess,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerFunction,
  PluginSettings,
  ProcessingResult,
  StringResultObject,
} from "src/types";
import { sendUrlCallback } from "src/utils/callbacks";
import { self } from "src/utils/self";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import {
  focusOrOpenNote,
  logErrorToConsole,
  logToConsole,
  showBrandedNotice,
} from "src/utils/ui";

export default class ActionsURI extends Plugin {
  // @ts-ignore
  settings: PluginSettings;

  defaultSettings: PluginSettings = {
    frontmatterKey: "uid",
  };

  async onload() {
    self(this);
    await this.loadSettings();
    this.registerRoutes(routes);
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  onunload() {
    // Just act natural.
  }

  async loadSettings() {
    this.settings = { ...this.defaultSettings, ...await this.loadData() };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Takes a list of routes and registers them together with their handlers in
   * Obsidian.
   *
   * Each incoming call is first validated against the route's schema; if it
   * passes, its handler is called, then a `x-success`/`x-error` callback is
   * sent out (if necessary) and the processed note is opened in Obsidian (if
   * necessary). If the validation fails, an error message is shown to the
   * user.
   *
   * @param routeTree - A `RoutePath` object containing information about the
   * route tree
   */
  private registerRoutes(routeTree: RoutePath) {
    const registeredRoutes: string[] = [];

    for (const [routePath, routeSubpaths] of Object.entries(routeTree)) {
      for (const route of routeSubpaths) {
        const { path, schema, handler } = route;
        const fullPath = normalizePath(`${URI_NAMESPACE}/${routePath}/${path}`)
          .replace(/\/$/, "");

        this.registerObsidianProtocolHandler(
          fullPath,
          async (incomingParams) => {
            const res = await schema.safeParseAsync(incomingParams);
            res.success
              ? await this.handleIncomingCall(
                handler,
                res.data as z.infer<typeof schema>,
              )
              : this.handleParseError(res.error, incomingParams);
          },
        );

        registeredRoutes.push(fullPath);
      }
    }

    logToConsole("Registered URI handlers:", registeredRoutes);
  }

  /**
   * This function deals with valid incoming calls. It calls the responsible
   * handler and sends out a callback (if necessary) and opens the processed
   * note (if necessary).
   *
   * @param handlerFunc - A route handler function
   * @param params - Parameters from the incoming `x-callback-url` call after
   * being parsed & validated by Zod
   *
   * @returns A `ProcessingResult` object containing the incoming parameters,
   * results from the handler, the callback sending and the note opening
   */
  private async handleIncomingCall(
    handlerFunc: HandlerFunction,
    params: AnyParams,
  ): Promise<ProcessingResult> {
    let handlerResult: AnyHandlerResult;

    try {
      handlerResult = await handlerFunc.bind(this)(params);
    } catch (error) {
      const msg = `Handler error: ${(<Error> error).message}`;
      handlerResult = failure(ErrorCode.HandlerError, msg);
      showBrandedNotice(msg);
      logErrorToConsole(msg);
    }

    const res = <ProcessingResult> {
      params: this.prepParamsForConsole(params),
      handlerResult,
      sendCallbackResult: this.sendUrlCallbackIfNeeded(handlerResult, params),
      openResult: await this.openFileIfNeeded(handlerResult, params),
    };

    logToConsole("Call handled:", res);
    return res;
  }

  /**
   * To prevent circular references and max call stack errors related to files,
   * we'll to convert all `TAbstractFile` instances to path strings which is what
   * they were in the original incoming call anyways.
   */
  private prepParamsForConsole(params: AnyParams): AnyParams {
    const newParams: any = { ...params };

    Object.keys(params).forEach((key) => {
      const value = (<any> params)[key];
      newParams[key] = value instanceof TAbstractFile ? value.path : value;
    });

    return <AnyParams> newParams;
  }

  /**
   * When the parameters of an incoming `x-callback-url` call fail to parse or
   * validate, and thus can't be further processed, we have to inform the user,
   * conveying the error message.
   *
   * @param parseError - The error object returned from Zod's `.safeParse`
   * method
   * @param params - Parameters from the incoming `x-callback-url` call after
   * being parsed & validated by Zod
   */
  private handleParseError(parseError: ZodError, params: ObsidianProtocolData) {
    const msg = [
      "Incoming call failed",
      parseError.errors.map((e) => {
        // Some zod errors are too verbose, from them we strip everything but
        // the important part.
        const message = e.message.replace(/^.+(Expected )/g, "$1");
        return e.path.length > 0
          ? `- ${e.path.join(".")}: ${message}`
          : `- ${message}`;
      }),
    ]
      .flat()
      .join("\n");

    showBrandedNotice(msg);
    logErrorToConsole(msg);
    if (!params["x-error"]) return;

    // If there's a "note not found" error, that's the biggest issue, we'll
    // return only that
    const error404 = parseError.errors
      .find((e) => e.message === STRINGS.note_not_found);
    if (error404) {
      sendUrlCallback(
        params["x-error"],
        failure(ErrorCode.NotFound, `[Not found] ${error404.path.join(", ")}`),
        params,
      );
      return;
    }

    const msg2 = "[Bad request] " +
      parseError.errors
        .map((e) => {
          return e.path.length > 0
            ? `${e.path.join(", ")}: ${e.message}`
            : e.message;
        })
        .join("; ");

    sendUrlCallback(
      params["x-error"],
      failure(ErrorCode.HandlerError, msg2),
      params,
    );
  }

  /**
   * Using the passed-in result object the method determines whether we should
   * or even can send a URL callback to the original sender.
   *
   * If the original call contained a non-empty `silent` parameter, we don't
   * send a callback.
   *
   * Otherwise, we trigger callback sending if …
   * - the result object contains a success and a `x-success` parameter
   * - the result object contains a failure and a `x-error` parameter
   *
   * @param handlerRes - A `*Result` object returned by a route handler
   *
   * @see {@link sendUrlCallback}
   */
  private sendUrlCallbackIfNeeded(
    handlerRes: AnyHandlerResult,
    params: AnyParams,
  ): StringResultObject {
    if (handlerRes.isSuccess) {
      return params["x-success"]
        ? sendUrlCallback(
          params["x-success"],
          <AnyHandlerSuccess> handlerRes,
          params,
        )
        : success("No `x-error` callback URL provided");
    }

    return params["x-error"]
      ? sendUrlCallback(params["x-error"], <HandlerFailure> handlerRes, params)
      : success("No `x-error` callback URL provided");
  }

  /**
   * @param handlerResult - Any handler result object
   * @param params - Parameters from the incoming `x-callback-url` call after
   * being parsed & validated by Zod
   *
   * @returns A successful `StringResultObject` object, the `result` prop
   * containing information on what was done. This function won't return a
   * failure.
   */
  private async openFileIfNeeded(
    handlerResult: AnyHandlerResult,
    params: AnyParams,
  ): Promise<StringResultObject> {
    // Do we need to open anything in general?
    if (!handlerResult.isSuccess) {
      return success("No file to open, the handler failed");
    }

    if ((<any> params).silent) {
      return success("No file to open, the `silent` parameter was set");
    }

    // Do we have information what to open?
    const { processedFilepath } = <HandlerFileSuccess> handlerResult;
    if (!processedFilepath) {
      return success(
        "No file to open, handler didn't return a `processedFilepath` property",
      );
    }

    return await focusOrOpenNote(processedFilepath);
  }
}
