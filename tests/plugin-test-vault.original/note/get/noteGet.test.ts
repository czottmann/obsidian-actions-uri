import * as fs from "fs/promises";
import * as path from "path";
import * as moment from "moment";
import { callObsidian, pause } from "#tests/helpers";
import { PeriodicNoteSet, RecentPeriodicNoteSet } from "#tests/types.d";

describe("/note/get", () => {
  const now = moment();
  const periodicNoteVariants: PeriodicNoteSet[] = [
    { key: "daily", dateFormat: "YYYY-MM-DD" },
    { key: "weekly", dateFormat: "gggg-[W]ww" },
    { key: "monthly", dateFormat: "YYYY-MM" },
    { key: "quarterly", dateFormat: "YYYY-[Q]Q" },
    { key: "yearly", dateFormat: "YYYY" },
  ];

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
    for (const p of periodicNoteVariants) {
      const res = await callObsidian("note/get", { "periodic-note": p.key });
      expect(res.ok).toBe(true);
      if (res.ok) {
        const dateString = now.format(p.dateFormat);
        expect(res.value["result-filepath"]).toContain(dateString);
      }
    }
  });

  it("should return note content for recent periodic notes", async () => {
    const recentPeriods: RecentPeriodicNoteSet[] = [
      { key: "recent-daily", dateString: "2025-05-18" },
      { key: "recent-weekly", dateString: "2025-W20" },
      { key: "recent-monthly", dateString: "2025-04" },
      { key: "recent-quarterly", dateString: "2025-Q1" },
      { key: "recent-yearly", dateString: "2024" },
    ];

    expect(globalThis.__TEST_VAULT_PATH__).toBeDefined();
    const vaultPath = globalThis.__TEST_VAULT_PATH__!;

    // Gather the list of current periodic notes (these are created during vault
    // launch), so we can move them out of the way in order to test the lookup
    // of recent periodic notes.
    const renames = periodicNoteVariants.map((p) => {
      const dateString = now.format(p.dateFormat);
      const oldName = path.join(vaultPath, `${dateString}.md`);
      const newName = path.join(vaultPath, `${dateString}.md.bak`);
      return [oldName, newName];
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
      for (const p of recentPeriods) {
        const res = await callObsidian("note/get", { "periodic-note": p.key });
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
