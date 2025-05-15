import { setupVault, teardownVault } from "./setup-vault";
import { CallbackServer } from "./callback-server";
import { sendUri } from "./send-uri";
import * as path from "path";

const TEST_PORT = 3000;

describe("Info Route", () => {
  let vaultPath: string;
  let callbackServer: CallbackServer;

  beforeAll(async () => {
    // Build the plugin first
    // This assumes you have a build script like `npm run build`
    // You might need to adjust this based on your actual build process
    // await execCommand('npm run build'); // Need to figure out how to run this before tests

    vaultPath = await setupVault();
    callbackServer = new CallbackServer(TEST_PORT);
    await callbackServer.start();

    // Open the vault in Obsidian
    // This is the part that requires manual intervention or a more robust solution
    // For now, we'll just send the URI and hope Obsidian opens it.
    // A real E2E test would need to ensure Obsidian is running and the vault is open.
    const openVaultUri = `obsidian://open?vault=${path.basename(vaultPath)}`;
    await sendUri(openVaultUri);

    // Give Obsidian some time to open and load the plugin
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Adjust time as needed
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    await callbackServer.stop();
    await teardownVault(vaultPath);
  });

  test("should return plugin info on success callback", async () => {
    const uri =
      `obsidian://actions-uri/info?vault=plugin-test-vault&x-success=http://localhost:${TEST_PORT}/callback&x-error=http://localhost:${TEST_PORT}/callback`;

    const callbackPromise = callbackServer.waitForCallback();
    await sendUri(uri);
    const callbackData = await callbackPromise;

    expect(callbackData).toHaveProperty("success");
    const successData = JSON.parse(callbackData.success);

    // Basic checks for the structure of the info response
    expect(successData).toHaveProperty("plugin_version");
    expect(successData).toHaveProperty("obsidian_version");
    expect(successData).toHaveProperty("api_version");
    expect(successData).toHaveProperty("min_obsidian_version");
  }, 10000); // Increase timeout for the test
});
