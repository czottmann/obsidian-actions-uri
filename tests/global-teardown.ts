import * as fs from "fs/promises";
import { asyncExec } from "./helpers";

/**
 * Tears down (removes) the specified test vault directory.
 */
export default async function globalTeardown() {
  console.log("\nTearing down test vault…");

  console.log("- Signalling Obsidian to close the vault…");
  await asyncExec(
    `open "obsidian://actions-uri/vault/close?vault=${__TEST_VAULT_NAME__}"`,
  );

  console.log(`- Removing temp vault at ${__TEST_VAULT_PATH__}…`);
  if (__TEST_VAULT_PATH__) {
    // We don't remove the parent directory anymore, only the vault itself
    await fs.rm(__TEST_VAULT_PATH__, { recursive: true, force: true });
    __TEST_VAULT_PATH__ = undefined;
    console.log("- Removed temp vault");
  } else {
    console.warn("- No vault path found in `__TEST_VAULT_PATH__`!");
  }

  console.log("- Stopping HTTP callback server…");
  if (__CALLBACK_SERVER__) {
    await __CALLBACK_SERVER__.stop();
    __CALLBACK_SERVER__ = undefined;
    console.log("- Stopped server");
  } else {
    console.warn("- No global callback server instance found!");
  }
}
