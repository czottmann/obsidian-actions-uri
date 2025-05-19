import * as moment from "moment";
import { PeriodicNoteSet, RecentPeriodicNoteSet } from "#tests/types.d";

export const periodicNotes: PeriodicNoteSet[] = [
  { key: "daily", dateString: moment().format("YYYY-MM-DD") },
  { key: "weekly", dateString: moment().format("gggg-[W]ww") },
  { key: "monthly", dateString: moment().format("YYYY-MM") },
  { key: "quarterly", dateString: moment().format("YYYY-[Q]Q") },
  { key: "yearly", dateString: moment().format("YYYY") },
];

export const recentPeriodicNotes: RecentPeriodicNoteSet[] = [
  { key: "recent-daily", dateString: "2025-05-18" },
  { key: "recent-weekly", dateString: "2025-W20" },
  { key: "recent-monthly", dateString: "2025-04" },
  { key: "recent-quarterly", dateString: "2025-Q1" },
  { key: "recent-yearly", dateString: "2024" },
];
