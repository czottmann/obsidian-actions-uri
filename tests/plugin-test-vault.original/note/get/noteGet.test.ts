import { callObsidian } from "#tests/helpers";

describe("Note Get Route", () => {
  test("should return note content on success callback", async () => {
    console.log(__dirname);

    const res = await callObsidian("note/get", { file: "Welcome.md" });

    // TODO: Add specific assertions for note/get route
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toHaveProperty("result-content");
      expect(res.value["result-content"]).toContain(
        "This is your new *vault*.",
      ); // Example assertion
    }
  }, 10000); // Increase timeout for the test
});
