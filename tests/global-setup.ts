import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import chokidar from "chokidar";
import { CallbackServer } from "./callback-server";
import { asyncExec, pause } from "./helpers";
import { id as pluginID } from "../manifest.json";

/**
 * The name of the vault used for testing. The value of the constant is the same
 * as the "blueprint" test vault stored in the `__tests__/` folder, sans the
 * extension, i.e. `plugin-test-vault` (value) instead of
 * `plugin-test-vault.original` (the folder).
 *
 * This constant is used in setting up the actual test vault (see the
 * `setup-vault.ts` script), and for deciding how XCU callbacks are made (see
 * `src/utils/callbacks.ts`).
 */
const testVaultName = "plugin-test-vault";

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

  const blueprintVaultPath = path.join(__dirname, `${testVaultName}.original`);
  const testVaultDir = path.join(os.homedir(), "tmp");
  const testVaultPath = path.join(testVaultDir, testVaultName);
  const obsidianDir = path.join(testVaultPath, ".obsidian");
  const pluginDir = path.join(obsidianDir, "plugins", pluginID);

  // Ensure the parent directory for the test vault exists
  console.log("- Creating temp vault…");
  await createTestVault(testVaultDir, testVaultPath, blueprintVaultPath);

  // Ensure the plugin is in the community-plugins.json and compiled files are copied
  console.log(`- Ensuring ${pluginID} plugin is enabled…`);
  await ensureTestPluginIsEnabled(pluginDir, obsidianDir);

  console.log("- Copying new plugin build into test vault…");
  copyNewPluginBuildIntoTestVault(pluginDir);

  console.log(`- Opening test vault in Obsidian…`);
  await openTestVaultInObsidian();

  console.log(`- Starting the global callback server…`);
  const httpServer = await startHTTPServer();

  console.log("- Finding NDJSON console log file and setting up watcher…");
  const consoleLogFile = await locateLogstravaganzaLogFile(testVaultPath);

  console.log(`- Watching ${consoleLogFile} for new log entries…`);
  const { logPath, logWatcher } = await startLogFileWatcher(
    testVaultPath,
    consoleLogFile,
  );

  global.httpServer = httpServer;
  global.testVault = {
    logPath,
    logRows: [],
    logWatcher,
    name: testVaultName,
    path: testVaultPath,
  };

  console.log("Test vault set up!\n");
}

async function startLogFileWatcher(
  testVaultPath: string,
  consoleLogFile: string,
) {
  const logPath = path.join(testVaultPath, consoleLogFile);

  // Use polling as the file might be written to by another process
  const logWatcher = chokidar.watch(logPath, {
    persistent: true,
    usePolling: true,
    interval: 50,
  });

  // `lastSize` keeps track of the last read position, so we can read only new
  // lines, starting from the moment the vault setup is complete.
  let lastSize = (await fs.stat(logPath)).size;

  logWatcher.on("change", async () => {
    try {
      const stats = await fs.stat(logPath);
      const currentSize = stats.size;

      if (currentSize > lastSize) {
        const fileHandle = await fs.open(logPath, "r");
        const buffer = Buffer.alloc(currentSize - lastSize);
        await fileHandle.read(buffer, 0, currentSize - lastSize, lastSize);
        await fileHandle.close();

        const newContent = buffer.toString();
        const lines = newContent.split("\n").filter((line) => line.length);
        global.testVault.logRows.push(...lines);
        lastSize = currentSize;
      }
    } catch (e) {
      console.error("Error reading new lines from console log file:", e);
    }
  });

  return { logPath, logWatcher };
}

async function locateLogstravaganzaLogFile(
  testVaultPath: string,
): Promise<string> {
  const vaultFiles = await fs.readdir(testVaultPath);
  const consoleLogFile = vaultFiles.find((file) => file.endsWith(".ndjson"));

  if (!consoleLogFile) {
    throw new Error(`No NDJSON file found in test vault at ${testVaultPath}`);
  }

  return consoleLogFile;
}

async function startHTTPServer() {
  const httpServer = new CallbackServer();
  await httpServer.start();
  return httpServer;
}

/**
 * Open the vault in Obsidian and give it a moment to load.
 */
async function openTestVaultInObsidian() {
  await asyncExec(`open "obsidian://open?vault=${testVaultName}"`);
  await pause(2000);
}

/**
 * Copy the compiled plugin files from the project root to the vault's plugin
 * directory.
 */
function copyNewPluginBuildIntoTestVault(pluginDir: string) {
  ["main.js", "manifest.json"]
    .forEach(async (file) => {
      try {
        await fs.copyFile(file, path.join(pluginDir, file));
      } catch (e) {
        throw new Error(`Failed to copy ${file}: ${e}`);
      }
    });
}

async function ensureTestPluginIsEnabled(
  pluginDir: string,
  obsidianDir: string,
) {
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
}

async function createTestVault(
  testVaultDir: string,
  testVaultPath: string,
  blueprintVaultPath: string,
) {
  await fs.mkdir(testVaultDir, { recursive: true });

  // Remove existing test vault if it exists
  try {
    await fs.rm(testVaultPath, { recursive: true, force: true });
  } catch (e) {
    // Ignore if it doesn't exist
  }

  // Copy the blueprint vault
  await fs.cp(blueprintVaultPath, testVaultPath, { recursive: true });
}
