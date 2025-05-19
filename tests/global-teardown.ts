import * as fs from "fs/promises";
import { asyncExec, pause } from "./helpers";
import { TESTING_VAULT } from "#src/constants";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault…");

  console.log("- Signalling Obsidian to close the vault…");
  await asyncExec(
    `open "obsidian://actions-uri/vault/close?vault=${TESTING_VAULT}"`,
  );

  console.log(`- Removing temp vault…`);
  if (globalThis.__TEST_VAULT_PATH__) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(
      globalThis.__TEST_VAULT_PATH__,
      { recursive: true, force: true },
    );
    console.log(`- Removed temp vault at: ${globalThis.__TEST_VAULT_PATH__}`);
  } else {
    console.warn("- No vault path found in `globalThis.__TEST_VAULT_PATH__`!");
  }

  console.log("- Stopping HTTP callback server…");
  if (globalThis.__CALLBACK_SERVER__) {
    await globalThis.__CALLBACK_SERVER__.stop();
    console.log("- Stopped server");
  } else {
    console.warn("- No global callback server instance found!");
  }
}
