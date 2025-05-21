import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import chokidar from "chokidar";
import { CallbackServer } from "./callback-server";
import { asyncExec, pause } from "./helpers";
import { id as pluginID } from "../manifest.json";
import { TESTING_VAULT as testVaultName } from "#src/constants";

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
  console.log("\nSetting up test vault…");
  global.testVaultName = testVaultName;

  const blueprintVaultPath = path.join(__dirname, `${testVaultName}.original`);
  const testVaultDir = path.join(os.homedir(), "tmp");
  const testVaultPath = path.join(testVaultDir, testVaultName);

  // Store the vault path globally for teardown
  global.testVaultPath = testVaultPath;

  // Ensure the parent directory for the test vault exists
  await fs.mkdir(testVaultDir, { recursive: true });

  console.log("- Creating temp vault…");
  // Remove existing test vault if it exists
  try {
    await fs.rm(testVaultPath, { recursive: true, force: true });
  } catch (e) {
    // Ignore if it doesn't exist
  }

  // Copy the blueprint vault
  await fs.cp(blueprintVaultPath, testVaultPath, { recursive: true });

  // Ensure the plugin is in the community-plugins.json and compiled files are copied
  const obsidianDir = path.join(testVaultPath, ".obsidian");
  const pluginsDir = path.join(obsidianDir, "plugins");
  const pluginDir = path.join(pluginsDir, pluginID);

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

  if (!communityPlugins.includes(pluginID)) {
    communityPlugins.push(pluginID);
    await fs.writeFile(communityPluginsPath, JSON.stringify(communityPlugins));
  }

  // Copy the compiled plugin files from the project root to the vault's plugin
  // directory
  ["main.js", "manifest.json"]
    .forEach(async (file) => {
      try {
        await fs.copyFile(file, path.join(pluginDir, file));
      } catch (e) {
        console.error(`- Failed to copy ${file}:`, e);
      }
    });

  console.log(`- Created temporary vault at ${testVaultPath}`);

  // Open the vault in Obsidian and give it a moment to load
  const openVaultUri = `obsidian://open?vault=${testVaultName}`;
  await asyncExec(`open "${openVaultUri}"`);
  await pause(2000);

  console.log(`- Starting the global callback server…`);
  const callbackServer = new CallbackServer();
  await callbackServer.start();

  console.log("- Finding NDJSON console log file and setting up watcher…");
  const vaultFiles = await fs.readdir(testVaultPath);
  const consoleLogFile = vaultFiles.find((file) => file.endsWith(".ndjson"));

  if (consoleLogFile) {
    const consoleLogFilePath = path.join(testVaultPath, consoleLogFile);
    global.testVaultLogPath = consoleLogFilePath;
    console.log(`- Found ${consoleLogFile}`);

    global.testVaultLogRows = [];
    global.testVaultLogWatcher = chokidar.watch(consoleLogFilePath, {
      persistent: true,
      usePolling: true, // Use polling as the file might be written to by another process
      interval: 50,
    });

    // To keep track of the last read position
    let lastSize = (await fs.stat(consoleLogFilePath)).size;

    global.testVaultLogWatcher.on("change", async () => {
      try {
        const stats = await fs.stat(consoleLogFilePath);
        const currentSize = stats.size;

        if (currentSize > lastSize) {
          const fileHandle = await fs.open(consoleLogFilePath, "r");
          const buffer = Buffer.alloc(currentSize - lastSize);
          await fileHandle.read(buffer, 0, currentSize - lastSize, lastSize);
          await fileHandle.close();

          const newContent = buffer.toString();
          const lines = newContent.split("\n").filter((line) => line.length);
          global.testVaultLogRows.push(...lines);
          lastSize = currentSize;
        }
      } catch (e) {
        console.error("Error reading new lines from console log file:", e);
      }
    });
  } else {
    console.warn("- No console log file found in the test vault.");
  }
  global.testVaultLogRows = []; // Clear the log lines array

  // Make the server instance globally available for tests
  global.callbackServer = callbackServer;

  console.log("");
}
