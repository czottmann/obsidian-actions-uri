import { callObsidian } from "#tests/helpers";

describe("note/open", () => {
  it("should open a note by its file name", async () => {
    const res = await callObsidian(
      "note/open",
      { file: "note/open/note-1.md" },
    );
    expect(res.ok).toBe(true);
  });

  it("should open a note by its UID", async () => {
    const res = await callObsidian(
      "note/open",
      { uid: "01JVM672TZYJ134Z74M2HY8GNC" },
    );
    expect(res.ok).toBe(true);
  });

  it.todo("should open a periodic note");

  it("should return an error when the requested note doesn't exist", async () => {
    const res1 = await callObsidian("note/open", { uid: "unknown-id" });
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.errorCode).toBe("404");
    }

    const res2 = await callObsidian("note/open", { file: "missing-note.md" });
    expect(res2.ok).toBe(false);
  });
});
