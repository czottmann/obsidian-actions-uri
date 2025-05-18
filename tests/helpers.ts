import { exec } from "child_process";
import { platform } from "os";
import { promisify } from "util";

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
