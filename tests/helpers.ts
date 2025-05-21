import { exec } from "child_process";
import { randomUUID } from "crypto";
import { platform } from "os";
import { promisify } from "util";
import { LogEntry, Result } from "./types";

export const asyncExec = promisify(exec);

export function sendUri(uri: string): Promise<void> {
  let command: string;
  const osType = platform();

  switch (osType) {
    // macOS
    case "darwin":
      command = `open "${uri}"`;
      break;

    // Windows
    case "win32":
      command = `start "" "${uri}"`;
      break;

    // Linux
    case "linux":
      command = `xdg-open "${uri}"`;
      break;

    default:
      return Promise.reject(new Error(`Unsupported OS: ${osType}`));
  }

  return new Promise((resolve, reject) => {
    exec(
      command,
      (error) => error ? reject(error) : resolve(),
    );
  });
}

/** A simple wait-for-n-ms function. */
export async function pause(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(
      () => resolve(),
      milliseconds,
    );
  });
}

/**
 * Calls an Obsidian Actions URI endpoint and waits for a callback from the test callback server.
 *
 * This function constructs an Obsidian URI with the specified route path and payload parameters.
 * It automatically includes the required 'vault', 'x-success', and 'x-error' parameters,
 * setting 'x-success' to the '/success' endpoint and 'x-error' to the '/failure' endpoint
 * of the local test callback server (http://localhost:3000).
 *
 * After sending the URI to Obsidian, the function waits for a response from the callback server.
 * The response is returned as a `Result` object, containing either the success value (`ok: true`)
 * or an error object (`ok: false`), based on which callback endpoint was invoked by the Obsidian plugin.
 *
 * @template T - The expected type of the success value.
 * @template E - The expected type of the error object.
 *
 * @param path - The route path of the Actions URI endpoint to call (e.g., "note/get", "file/create").
 * @param payload - An optional object containing key-value pairs for the endpoint's URL parameters.
 * @param timeout - The maximum time to wait for a callback from the server (default: 3000 ms).
 * @returns A Promise that resolves with a `Result` object.
 *          - If the '/success' callback is received, `result.ok` is true and `result.value` contains the received data.
 *          - If the '/failure' callback is received, `result.ok` is false and `result.error` contains the received error data.
 *          - If a timeout or unknown error occurs, `result.ok` is false and `result.error` contains the error.
 */
export async function callObsidian<T = any, E = any>(
  path: string,
  payload: Record<string, any> = {},
  timeout: number = 3000,
): Promise<Result<T, E>> {
  const cbServer = global.httpServer!;

  const uri = constructObsidianURI(path, payload);
  const cbPromise = cbServer.waitForCallback(timeout);
  await sendUri(uri);
  let callbackRes;

  try {
    callbackRes = await cbPromise;
  } catch (error) {
    // Handle timeout or other errors from `waitForCallback()`
    return {
      ok: false,
      error: error as E,
      log: await collectRecentLogEntries(),
    };
  }

  const logEntries = await collectRecentLogEntries();

  if (callbackRes.success) {
    try {
      // Attempt to parse success data if it's a JSON string
      const parsedValue = JSON.parse(callbackRes.success);
      return { ok: true, value: parsedValue as T, log: logEntries };
    } catch (e) {
      // If parsing fails, return the raw string
      return { ok: true, value: callbackRes.success as T, log: logEntries };
    }
  } else if (callbackRes.error) {
    // Assuming error data is always an object with errorCode and errorMessage
    return { ok: false, error: callbackRes.error as E, log: logEntries };
  }

  // Should not happen if `waitForCallback()` works correctly
  return {
    ok: false,
    error: new Error("Unknown callback data received") as E,
    log: logEntries,
  };
}

/**
 * Collects recent log entries from the test vault and clears the log rows.
 * This function is used to gather log entries after a callback is received.
 *
 * @returns A Promise that resolves with an array of log entries.
 */
async function collectRecentLogEntries(): Promise<LogEntry[]> {
  await pause(100);
  const logEntries = global.testVault.logRows.map((l) => JSON.parse(l));
  global.testVault.logRows = [];
  return logEntries;
}

/**
 * Constructs an Obsidian URI with the specified route path and payload parameters.
 * Automatically includes the required 'vault', 'x-success', and 'x-error' parameters.
 *
 * @param path - The route path of the Actions URI endpoint to call (e.g., "note/get", "file/create").
 * @param payload - An object containing key-value pairs for the endpoint's URL parameters.
 * @returns A string representing the constructed Obsidian URI.
 */
function constructObsidianURI(
  path: string,
  payload: Record<string, any>,
): string {
  // Generate a unique identifier for the callback so it's easier to track
  const uuid = randomUUID();
  const cbServer = global.httpServer;
  const url = new URL(`obsidian://actions-uri/${path}`);

  // Set required parameters
  url.searchParams.set("vault", global.testVault.name);

  // Allow for custom x-success parameter, even if rarely used
  if (
    Object.hasOwn(payload, "x-success") &&
    typeof payload["x-success"] !== "undefined"
  ) {
    url.searchParams.set("x-success", payload["x-success"]);
  } else {
    url.searchParams.set("x-success", `${cbServer.baseURL}/success/${uuid}`);
  }

  // Allow for custom x-error parameter, even if rarely used
  if (
    Object.hasOwn(payload, "x-error") &&
    typeof payload["x-error"] !== "undefined"
  ) {
    url.searchParams.set("x-error", payload["x-error"]);
  } else {
    url.searchParams.set("x-error", `${cbServer.baseURL}/failure/${uuid}`);
  }

  // Add payload parameters
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      url.searchParams.set(key, String(payload[key]));
    }
  }

  return url.toString();
}
