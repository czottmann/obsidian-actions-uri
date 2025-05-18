import { callObsidian } from "#tests/helpers";

describe("/note/get", () => {
  test("should return note content on success callback", async () => {
    // console.log(__dirname);

    const res = await callObsidian("note/get", { file: "note/get/note-1.md" });
    expect(res.ok).toBe(true);

    if (res.ok) {
      expect(res.value["result-filepath"]).toBe("note/get/note-1.md");
      expect(res.value["result-body"]).not.toEqual("");
      expect(res.value["result-content"]).toContain("# Hello");
      expect(res.value["result-front-matter"])
        .toBe("tags:\n  - one\n  - two\nid: 01JV9K2XGJA4HH5XVWKC8EPQ4W\n");
      expect(JSON.parse(res.value["result-properties"]))
        .toEqual({ tags: ["one", "two"], id: "01JV9K2XGJA4HH5XVWKC8EPQ4W" });
      expect(res.value["result-uri-path"])
        .toContain("file=note%2Fget%2Fnote-1.md");
    }
  }, 10000);

  test("should return error on failure callback", async () => {
    const res = await callObsidian("note/get", { file: "note/get/invalid.md" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.errorCode).toBe("404");
    }
  }, 10000);
});
