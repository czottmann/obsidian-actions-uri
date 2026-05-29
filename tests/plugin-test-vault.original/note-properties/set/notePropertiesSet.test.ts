import { callObsidian } from "#tests/helpers";

describe("/note-properties/set", () => {
  // Happy-path coverage for set/update mode (this route had no tests).
  // NB: this does NOT regression-guard the "await processFrontMatter" fix —
  // processFrontMatter updates the metadata cache synchronously, so the new
  // property is visible to getNoteDetails even without awaiting. The await's
  // value is error propagation + durability, which isn't observable here.
  it("merges and returns the freshly-written property in the same response", async () => {
    const res = await callObsidian("note-properties/set", {
      file: "note-properties/set/note-1.md",
      mode: "update",
      properties: JSON.stringify({ regressionKey: "regressionValue" }),
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      const props = JSON.parse(res.value["result-properties"]);
      expect(props.regressionKey).toBe("regressionValue");
      // The pre-existing property must survive an "update"-mode merge.
      expect(props.existing).toBe(true);
    }
  }, 10000);
});
