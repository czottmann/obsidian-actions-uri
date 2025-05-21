import * as fs from "fs/promises";
import { asyncExec, pause } from "./helpers";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault…");

  console.log("- Signalling Obsidian to close the vault…");
  await asyncExec(
    `open "obsidian://actions-uri/vault/close?vault=${global.testVaultName}"`,
  );
  // Wait for a moment to ensure the vault is closed, including all open files
  await pause(500);

  // Close the console log watcher
  if (global.testVaultLogWatcher) {
    await global.testVaultLogWatcher.close();
    console.log("- Closed the console log watcher.");
  }

  console.log(`- Removing temp vault at ${global.testVaultPath}…`);
  if (global.testVaultPath) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(global.testVaultPath, { recursive: true, force: true });
    console.log("- Removed temp vault");
  } else {
    console.warn("- No vault path found in `global.testVaultPath`!");
  }

  console.log("- Stopping HTTP callback server…");
  if (global.callbackServer) {
    await global.callbackServer.stop();
    console.log("- Stopped server");
  } else {
    console.warn("- No global callback server instance found!");
  }
}
