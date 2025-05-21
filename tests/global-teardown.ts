import * as fs from "fs/promises";
import { asyncExec, pause } from "./helpers";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault…");

  await asyncExec(
    `open "obsidian://actions-uri/vault/close?vault=${global.testVault.name}"`,
  );
  console.log("- Signalled Obsidian to close the vault…");
  // Wait for a moment to ensure the vault is closed, including all open files
  await pause(500);

  // Close the console log watcher
  if (global.testVault.logWatcher) {
    await global.testVault.logWatcher.close();
    console.log("- Quit the console log watcher");
  }

  if (global.testVault.path) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(global.testVault.path, { recursive: true, force: true });
    console.log(`- Removed temp vault at ${global.testVault.path}`);
  } else {
    console.warn("- No vault path found in `global.testVault.path`!");
  }

  if (global.httpServer) {
    await global.httpServer.stop();
    console.log("- Stopped HTTP callback server");
  } else {
    console.warn("- No HTTP server instance found!");
  }
}
