import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const PLUGIN_ID = "obsidian-actions-uri"; // Replace with your actual plugin ID from manifest.json
const BLUEPRINT_VAULT_PATH = path.join(__dirname, "plugin-test-vault.original");
const TEST_VAULT_DIR = path.join(os.homedir(), "tmp");
const TEST_VAULT_PATH = path.join(TEST_VAULT_DIR, "plugin-test-vault");

export async function setupVault(): Promise<string> {
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

  // Copy the compiled plugin files
  // Assuming compiled files are in the project root or a 'dist' folder
  // You might need to adjust these paths based on your build process
  await fs.copyFile("main.js", path.join(pluginDir, "main.js"));
  await fs.copyFile("manifest.json", path.join(pluginDir, "manifest.json"));
  // Copy other necessary files like styles.css if they exist
  try {
    await fs.copyFile("styles.css", path.join(pluginDir, "styles.css"));
  } catch (e) {
    // styles.css might not exist, ignore error
  }

  console.log(`Created temporary vault at: ${TEST_VAULT_PATH}`);
  return TEST_VAULT_PATH;
}

export async function teardownVault(vaultPath: string): Promise<void> {
  // We don't remove the parent directory anymore, only the vault itself
  await fs.rm(vaultPath, { recursive: true, force: true });
  console.log(`Removed temporary vault at: ${vaultPath}`);
}

// Example usage (for testing the setup script itself)
// if (require.main === module) {
//   setupVault().then(async (vaultPath) => {
//     // Keep the vault for inspection
//     console.log(`Vault created at ${vaultPath}. Not tearing down.`);
//     // await teardownVault(vaultPath);
//   });
// }
