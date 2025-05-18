import * as fs from "fs/promises";
import { asyncExec, pause } from "./helpers";
import { TESTING_VAULT } from "#src/constants";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault...");

  // Attempt to close the vault before removing
  await attemptVaultClosing();

  if (globalThis.__TEST_VAULT_PATH__) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(
      globalThis.__TEST_VAULT_PATH__,
      { recursive: true, force: true },
    );
    console.log(`Removed temp vault at: ${globalThis.__TEST_VAULT_PATH__}`);
  } else {
    console.warn("No vault path found in `globalThis.__TEST_VAULT_PATH__`.");
  }

  // Stop the global callback server
  if (globalThis.__CALLBACK_SERVER__) {
    await globalThis.__CALLBACK_SERVER__.stop();
    // Clean up the global variable
    delete globalThis.__CALLBACK_SERVER__;
  } else {
    console.warn("No global callback server instance found.");
  }
}

/**
 * Attempts to close the test vault by sending an Obsidian URI command.
 *
 * This function is intended for internal use in test scenarios. It's using an
 * Actions URI route which isn't ideal (as Actions URI is what's to be tested)
 * but it'll have to do for now.
 */
async function attemptVaultClosing() {
  console.log("Attempting to close the vault...");
  await asyncExec(
    `open "obsidian://actions-uri/vault/close?vault=${TESTING_VAULT}"`,
  );
  await pause(1000);
}
