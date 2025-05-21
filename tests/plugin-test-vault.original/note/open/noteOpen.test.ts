import * as fs from "fs/promises";
import * as path from "path";
import { callObsidian, pause } from "#tests/helpers";
import { periodicNotes, recentPeriodicNotes } from "#tests/periodic-notes";

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

  it("should open periodic notes", async () => {
    for (const p of periodicNotes) {
      const res = await callObsidian("note/open", { "periodic-note": p.key });
      expect(res.ok).toBe(true);
    }
  });

  it("should open recent periodic notes", async () => {
    expect(global.testVaultPath).toBeDefined();
    const vaultPath = global.testVaultPath!;

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
        const res = await callObsidian("note/open", { "periodic-note": p.key });
        expect(res.ok).toBe(true);
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
