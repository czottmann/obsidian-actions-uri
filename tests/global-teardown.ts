import * as fs from "fs/promises";

import { asyncExec, pause } from "./helpers";
import { TESTING_VAULT } from "../src/constants";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault...");

  // Attempt to close the vault before removing
  await attemptVaultClosing();

  const vaultPath = process.env.TEST_VAULT_PATH;

  if (vaultPath) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(vaultPath, { recursive: true, force: true });
    console.log(`Removed temporary vault at: ${vaultPath}`);
  } else {
    console.warn("No test vault path found in environment variables.");
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

  // Wait for the vault to close
  await pause(1000);
}
