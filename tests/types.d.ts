export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

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
  dateFormat: string;
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
