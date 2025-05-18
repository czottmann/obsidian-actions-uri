import { TESTING_VAULT } from "../../../../src/constants";
import { CallbackServer } from "../../../callback-server";
import { pause, sendUri } from "../../../helpers";

// The TEST_PORT is defined and used within callback-server.ts
// const TEST_PORT = 3001;

describe("Note Get Route", () => {
  let callbackServer = new CallbackServer(); // Instantiate without port

  beforeAll(async () => {
    // The vault is set up globally now.
    // We still need to start the callback server for this test suite.
    await callbackServer.start();
  });

  afterAll(async () => {
    // Stop the callback server for this test suite.
    await callbackServer.stop();
  });

  test("should return note content on success callback", async () => {
    // TODO: Abstract the busy work here. Every call goes to "obsidian://actions-uri", and every call
    // has the same x-success and x-error callback URLs. This is a lot of boilerplate code. Same goes
    // for sending and waiting for the callback. Ideally, I'd like to have a function that accepts a
    // route/path (e.g., "/info") and a params object, and then it would handle the rest.

    console.log(__dirname);
    // Use the hardcoded port 3000 from callback-server.ts
    const uri =
      `obsidian://actions-uri/note/get?vault=${TESTING_VAULT}&file=Welcome.md&x-success=http://localhost:3000/callback&x-error=http://localhost:3000/callback`; // Example URI for note/get

    const callbackPromise = callbackServer.waitForCallback();
    await sendUri(uri);
    const res = await callbackPromise;

    // TODO: Add specific assertions for note/get route
    expect(res).toHaveProperty("success");
    const successData = JSON.parse(res.success);
    expect(successData).toHaveProperty("result-content");
    expect(successData["result-content"]).toContain("# Welcome"); // Example assertion
  }, 10000); // Increase timeout for the test
});
