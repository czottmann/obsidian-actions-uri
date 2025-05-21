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
 * @returns A Promise that resolves with a `Result` object.
 *          - If the '/success' callback is received, `result.ok` is true and `result.value` contains the received data.
 *          - If the '/failure' callback is received, `result.ok` is false and `result.error` contains the received error data.
 *          - The function throws an error if the callback server is not initialized or a timeout occurs.
 */
export async function callObsidian<T = any, E = any>(
  path: string,
  payload: Record<string, any> = {},
): Promise<Result<T, E>> {
  const cbServer = global.httpServer!;
  const uuid = randomUUID();
  const uri = constructObsidianURI(path, payload, uuid);
  const cbPromise = cbServer.waitForCallback();
  await sendUri(uri);
  const cbData = await cbPromise;
  await pause(100);

  // Get and remove new vault console output from the global array
  const logEntries: LogEntry[] = global.testVault.logRows
    .map((l) => JSON.parse(l));
  global.testVault.logRows = [];

  if (cbData.success) {
    try {
      // Attempt to parse success data if it's a JSON string
      const parsedValue = JSON.parse(cbData.success);
      return { ok: true, value: parsedValue as T, log: logEntries };
    } catch (e) {
      // If parsing fails, return the raw string
      return { ok: true, value: cbData.success as T, log: logEntries };
    }
  } else if (cbData.error) {
    // Assuming error data is always an object with errorCode and errorMessage
    return { ok: false, error: cbData.error as E, log: logEntries };
  } else {
    // Should not happen if waitForCallback works correctly
    return {
      ok: false,
      error: new Error("Unknown callback data received") as E,
      log: logEntries,
    };
  }
}

/**
 * Constructs an Obsidian URI with the specified route path and payload parameters.
 * Automatically includes the required 'vault', 'x-success', and 'x-error' parameters.
 *
 * @param path - The route path of the Actions URI endpoint to call (e.g., "note/get", "file/create").
 * @param payload - An object containing key-value pairs for the endpoint's URL parameters.
 * @param uuid - A UUID string to identify the request internally.
 * @returns A string representing the constructed Obsidian URI.
 */
function constructObsidianURI(
  path: string,
  payload: Record<string, any>,
  uuid: string,
): string {
  const cbServer = global.httpServer;
  const url = new URL(`obsidian://actions-uri/${path}`);

  // Set required parameters
  url.searchParams.set("vault", global.testVault.name);
  url.searchParams.set("x-success", `${cbServer.baseURL}/success/${uuid}`);
  url.searchParams.set("x-error", `${cbServer.baseURL}/failure/${uuid}`);

  // Add payload parameters
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      url.searchParams.set(key, String(payload[key]));
    }
  }

  return url.toString();
}
