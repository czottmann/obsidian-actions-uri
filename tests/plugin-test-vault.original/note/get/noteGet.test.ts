import * as fs from "fs/promises";
import * as path from "path";
import { callObsidian, pause } from "#tests/helpers";
import { periodicNotes, recentPeriodicNotes } from "#tests/periodic-notes";

describe("/note/get", () => {
  it("should return note content on success", async () => {
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

  it("should return error on failure", async () => {
    const res = await callObsidian("note/get", { file: "note/get/invalid.md" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.errorCode).toBe("404");
    }
  }, 10000);

  it("should return note content for periodic notes", async () => {
    for (const p of periodicNotes) {
      const res = await callObsidian(
        "note/get",
        { "periodic-note": p.key, silent: true },
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value["result-filepath"]).toContain(p.dateString);
      }
    }
  });

  it("should return note content for recent periodic notes", async () => {
    expect(global.testVault.path).toBeDefined();
    const vaultPath = global.testVault.path!;

    // Gather the list of current periodic notes (these are created during vault
    // launch), so we can move them out of the way in order to test the lookup
    // of recent periodic notes.
    const renames = periodicNotes.map((p) => {
      const oldName = path.join(vaultPath, `${p.dateString}.md`);
      return [oldName, oldName + ".bak"];
    });

    // Rename the current periodic notes for this test.
    for (const [oldName, newName] of renames) {
      try {
        await fs.rename(oldName, newName);
      } catch (e) {}
    }

    // Give Obsidian a moment to index the changes
    await pause(1000);

    try {
      for (const p of recentPeriodicNotes) {
        const res = await callObsidian(
          "note/get",
          { "periodic-note": p.key, silent: true },
        );
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value["result-filepath"]).toContain(p.dateString);
        }
      }
    } finally {
      // Change the current periodic notes back to their original names.
      for (const [oldName, newName] of renames) {
        try {
          await fs.rename(newName, oldName);
        } catch (e) {}
      }
    }
  });
});
