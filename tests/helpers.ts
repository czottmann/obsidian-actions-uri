import { exec } from "child_process";
import { platform } from "os";
import { promisify } from "util";
import { Result } from "./types";
import { TESTING_VAULT } from "#src/constants";

export const asyncExec = promisify(exec);

export function sendUri(uri: string): Promise<void> {
  let command: string;
  const osType = platform();

  if (osType === "darwin") {
    // macOS
    command = `open "${uri}"`;
  } else if (osType === "win32") {
    // Windows
    command = `start "" "${uri}"`;
  } else if (osType === "linux") {
    // Linux
    command = `xdg-open "${uri}"`;
  } else {
    return Promise.reject(new Error(`Unsupported OS: ${osType}`));
  }

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`URI sent: ${uri}`);
        resolve();
      }
    });
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
  const callbackServer = globalThis.__CALLBACK_SERVER__;
  if (!callbackServer) {
    throw new Error(
      "Callback server not initialized. Ensure global setup ran.",
    );
  }

  const baseUrl = `obsidian://actions-uri/${path}`;
  const url = new URL(baseUrl);

  // Set required parameters
  url.searchParams.set("vault", TESTING_VAULT);
  url.searchParams.set("x-success", "http://localhost:3000/success");
  url.searchParams.set("x-error", "http://localhost:3000/failure");

  // Add payload parameters
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      url.searchParams.set(key, String(payload[key]));
    }
  }

  const callbackPromise = callbackServer.waitForCallback();
  await sendUri(url.toString());
  const callbackData = await callbackPromise;

  if (callbackData.success) {
    try {
      // Attempt to parse success data if it's a JSON string
      const parsedValue = JSON.parse(callbackData.success);
      return { ok: true, value: parsedValue as T };
    } catch (e) {
      // If parsing fails, return the raw string
      return { ok: true, value: callbackData.success as T };
    }
  } else if (callbackData.error) {
    // Assuming error data is always an object with errorCode and errorMessage
    return { ok: false, error: callbackData.error as E };
  } else {
    // Should not happen if waitForCallback works correctly
    return {
      ok: false,
      error: new Error("Unknown callback data received") as E,
    };
  }
}
