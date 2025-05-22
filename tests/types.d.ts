import { CallbackServer } from "./callback-server";
import { FSWatcher } from "chokidar";

type TestVaultConfig = {
  logPath: string;
  logRows: string[];
  logWatcher: FSWatcher;
  name: string;
  path: string;
};

// Declare global variable
declare global {
  var httpServer: CallbackServer;
  var testVault: TestVaultConfig;
}

export type CallbackData = {
  success?: any;
  error?: any;
};

export type LogEntry = Record<string, any>;

export type Result<T, E> =
  | { ok: true; value: T; log?: LogEntry[] }
  | { ok: false; error: E; log?: LogEntry[] };

export type PeriodicNoteSet = {
  /**
   * The key used to identify the periodic note, e.g. "daily", "weekly", etc.
   */
  key:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "yearly";

  /**
   * The date format used in the periodic note, e.g. "YYYY-MM-DD" or "gggg-[W]ww".
   */
  dateString: string;
};

export type RecentPeriodicNoteSet = {
  /**
   * The key used to identify the periodic note, e.g. "daily", "weekly", etc.
   */
  key:
    | "recent-daily"
    | "recent-weekly"
    | "recent-monthly"
    | "recent-quarterly"
    | "recent-yearly";

  /**
   * A fixed date string used in the periodic note, e.g. "2025-05-19" or "2025-W20".
   */
  dateString: string;
};
