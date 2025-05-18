import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { asyncExec, pause } from "./helpers";
import { id as PLUGIN_ID } from "../manifest.json";
import { TESTING_VAULT } from "#src/constants";
import { CallbackServer } from "./callback-server";

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
 * 6. Opens the copied vault in Obsidian.
 * 7. Starts the global callback server.
 */
export default async function globalSetup() {
  console.log("\nSetting up test vault...");

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

  console.log(`Created temporary vault at: ${TEST_VAULT_PATH}`);

  // Open the vault in Obsidian, gives it a moment to load
  const openVaultUri = `obsidian://open?vault=${TESTING_VAULT}`;
  await asyncExec(`open "${openVaultUri}"`);
  await pause(2000);

  // Store the vault path globally for teardown
  globalThis.__TEST_VAULT_PATH__ = TEST_VAULT_PATH;

  // Start the global callback server
  // Use a fixed port, e.g., 3000, as defined in callback-server.ts
  const callbackServer = new CallbackServer();
  await callbackServer.start();
  // Make the server instance globally available for tests
  globalThis.__CALLBACK_SERVER__ = callbackServer;
}

// Declare global variable
declare global {
  var __CALLBACK_SERVER__: CallbackServer | undefined;
  var __TEST_VAULT_PATH__: string | undefined;
}
