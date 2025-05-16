import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

import { id as PLUGIN_ID } from "../manifest.json";
import { TESTING_VAULT } from "../src/constants";

import { sendUri } from "./helpers";

const BLUEPRINT_VAULT_PATH = path.join(__dirname, `${TESTING_VAULT}.original`);
const TEST_VAULT_DIR = path.join(os.homedir(), "tmp");
const TEST_VAULT_PATH = path.join(TEST_VAULT_DIR, TESTING_VAULT);

/**
 * Sets up a temporary Obsidian vault for testing purposes.
 *
 * This function performs the following steps:
 * 1. Ensures the parent directory for the test vault exists.
 * 2. Removes any existing test vault at the target location.
 * 3. Copies a blueprint vault to the test location.
 * 4. Ensures the plugin is enabled in the vault's `community-plugins.json`.
 * 5. Copies the compiled plugin files into the vault's plugin directory.
 * 6. Closes any open instance of the test vault.
 *
 * @returns {Promise<string>} The absolute path to the created test vault.
 */
export async function setUpVault(): Promise<string> {
  // Ensure the parent directory for the test vault exists
  await fs.mkdir(TEST_VAULT_DIR, { recursive: true });

  // Remove existing test vault if it exists
  try {
    await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
  } catch (e) {
    // Ignore if it doesn't exist
  }

  // Copy the blueprint vault
  await fs.cp(BLUEPRINT_VAULT_PATH, TEST_VAULT_PATH, { recursive: true });

  // Ensure the plugin is in the community-plugins.json and compiled files are copied
  const obsidianDir = path.join(TEST_VAULT_PATH, ".obsidian");
  const pluginsDir = path.join(obsidianDir, "plugins");
  const pluginDir = path.join(pluginsDir, PLUGIN_ID);

  await fs.mkdir(pluginDir, { recursive: true });

  // Update community-plugins.json to ensure the plugin is enabled
  const communityPluginsPath = path.join(obsidianDir, "community-plugins.json");
  let communityPlugins: string[] = [];
  try {
    const content = await fs.readFile(communityPluginsPath, "utf-8");
    communityPlugins = JSON.parse(content);
  } catch (e) {
    // File might not exist, start with empty array
  }

  if (!communityPlugins.includes(PLUGIN_ID)) {
    communityPlugins.push(PLUGIN_ID);
    await fs.writeFile(communityPluginsPath, JSON.stringify(communityPlugins));
  }

  // Copy the compiled plugin files from the project root to the vault's plugin
  // directory
  ["main.js", "manifest.json"]
    .forEach(async (file) => {
      try {
        await fs.copyFile(file, path.join(pluginDir, file));
      } catch (e) {
        console.error(`Failed to copy ${file}:`, e);
      }
    });

  attemptVaultClosing();
  console.log(`Created temporary vault at: ${TEST_VAULT_PATH}`);
  return TEST_VAULT_PATH;
}

/**
 * Tears down (removes) the specified test vault directory.
 *
 * @param vaultPath - The absolute path to the vault to remove.
 * @returns {Promise<void>}
 */
export async function tearDownVault(vaultPath: string): Promise<void> {
  // We don't remove the parent directory anymore, only the vault itself
  await fs.rm(vaultPath, { recursive: true, force: true });
  console.log(`Removed temporary vault at: ${vaultPath}`);
}

/**
 * Attempts to close the test vault by sending an Obsidian URI command.
 *
 * This function is intended for internal use in test scenarios. It's using an
 * Actions URI route which isn't ideal (as Actions URI is what's to be tested)
 * but it'll have to do for now.
 */
function attemptVaultClosing() {
  sendUri(`obsidian://actions-uri/vault/close?vault=${TESTING_VAULT}`);
  console.log("Attempting to close the vault...");
}

// Example usage (for testing the setup script itself)
// if (require.main === module) {
//   setupVault().then(async (vaultPath) => {
//     // Keep the vault for inspection
//     console.log(`Vault created at ${vaultPath}. Not tearing down.`);
//     // await teardownVault(vaultPath);
//   });
// }
