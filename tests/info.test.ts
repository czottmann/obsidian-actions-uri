import { TESTING_VAULT } from "../src/constants";
import { setUpVault, tearDownVault } from "./setup-vault";
import { CallbackServer } from "./callback-server";
import { pause, sendUri } from "./helpers";

const TEST_PORT = 3000;

describe("Info Route", () => {
  let callbackServer = new CallbackServer();

  beforeAll(async () => {
    // Build the plugin first
    // This assumes you have a build script like `npm run build`
    // You might need to adjust this based on your actual build process
    // await execCommand('npm run build'); // Need to figure out how to run this before tests

    await setUpVault();
    await callbackServer.start();

    // Open the vault in Obsidian
    // This is the part that requires manual intervention or a more robust solution
    // For now, we'll just send the URI and hope Obsidian opens it.
    // A real E2E test would need to ensure Obsidian is running and the vault is open.
    await sendUri(`obsidian://open?vault=${TESTING_VAULT}`);

    // Give Obsidian some time to open and load the plugin
    await pause(1000); // Adjust time as needed
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    await callbackServer.stop();
    await tearDownVault();
  });

  test("should return plugin info on success callback", async () => {
    // TODO: Abstract the busy work here. Every call goes to "obsidian://actions-uri", and every call
    // has the same x-success and x-error callback URLs. This is a lot of boilerplate code. Same goes
    // for sending and waiting for the callback. Ideally, I'd like to have a function that accepts a
    // route/path (e.g., "/info") and a params object, and then it would handle the rest.

    const uri =
      `obsidian://actions-uri/info?vault=${TESTING_VAULT}&x-success=http://localhost:${TEST_PORT}/callback&x-error=http://localhost:${TEST_PORT}/callback`;

    const callbackPromise = callbackServer.waitForCallback();
    await sendUri(uri);
    const res = await callbackPromise;

    expect(res).toHaveProperty("result-plugin-version");
    expect(res).toHaveProperty("result-api-version");
  }, 10000); // Increase timeout for the test
});
