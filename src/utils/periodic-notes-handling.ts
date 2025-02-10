import { moment, TFile } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  appHasMonthlyNotesPluginLoaded,
  appHasQuarterlyNotesPluginLoaded,
  appHasWeeklyNotesPluginLoaded,
  appHasYearlyNotesPluginLoaded,
  createDailyNote,
  createMonthlyNote,
  createQuarterlyNote,
  createWeeklyNote,
  createYearlyNote,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllQuarterlyNotes,
  getAllWeeklyNotes,
  getAllYearlyNotes,
  getDailyNote,
  getDailyNoteSettings,
  getMonthlyNote,
  getMonthlyNoteSettings,
  getQuarterlyNote,
  getQuarterlyNoteSettings,
  getWeeklyNote,
  getWeeklyNoteSettings,
  getYearlyNote,
  getYearlyNoteSettings,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "src/constants";
import { StringResultObject } from "src/types";
import { sanitizeFilePath } from "src/utils/file-handling";
import {
  isCommunityPluginEnabled,
  isCorePluginEnabled,
} from "src/utils/plugins";
import { ErrorCode, failure, success } from "src/utils/results-handling";
import { pause } from "src/utils/time";

// TYPES ----------------------------------------
export enum PeriodicNoteType {
  DailyNote = "daily",
  WeeklyNote = "weekly",
  MonthlyNote = "monthly",
  QuarterlyNote = "quarterly",
  YearlyNote = "yearly",
}

export enum PeriodicNoteTypeWithRecents {
  DailyNote = "daily",
  WeeklyNote = "weekly",
  MonthlyNote = "monthly",
  QuarterlyNote = "quarterly",
  YearlyNote = "yearly",
  RecentDailyNote = "recent-daily",
  RecentWeeklyNote = "recent-weekly",
  RecentMonthlyNote = "recent-monthly",
  RecentQuarterlyNote = "recent-quarterly",
  RecentYearlyNote = "recent-yearly",
}

// FUNCTIONS ----------------------------------------

export function getCurrentPeriodicNotePath(
  periodicNoteType: PeriodicNoteType,
): string {
  let getSettingsFn: Function;
  switch (periodicNoteType) {
    case PeriodicNoteType.DailyNote:
      getSettingsFn = getDailyNoteSettings;
      break;

    case PeriodicNoteType.WeeklyNote:
      getSettingsFn = getWeeklyNoteSettings;
      break;

    case PeriodicNoteType.MonthlyNote:
      getSettingsFn = getMonthlyNoteSettings;
      break;

    case PeriodicNoteType.QuarterlyNote:
      getSettingsFn = getQuarterlyNoteSettings;
      break;

    case PeriodicNoteType.YearlyNote:
      getSettingsFn = getYearlyNoteSettings;
      break;
  }

  const { format, folder } = getSettingsFn();
  const title = moment().format(format);
  return sanitizeFilePath(`${folder}/${title}.md`);
}

export function getMostRecentPeriodicNotePath(
  periodicNoteType: PeriodicNoteType,
): StringResultObject {
  const notes = getAllPeriodicNotes(periodicNoteType);
  const mostRecentKey = Object.keys(notes).sort().last();
  return mostRecentKey
    ? success(notes[mostRecentKey].path)
    : failure(ErrorCode.NotFound, STRINGS.note_not_found);
}

export function getCurrentPeriodicNote(
  periodicNoteType: PeriodicNoteType,
): TFile | undefined {
  const now = moment();
  switch (periodicNoteType) {
    case PeriodicNoteType.DailyNote:
      return getDailyNote(now, getAllDailyNotes());

    case PeriodicNoteType.WeeklyNote:
      return getWeeklyNote(now, getAllWeeklyNotes());

    case PeriodicNoteType.MonthlyNote:
      return getMonthlyNote(now, getAllMonthlyNotes());

    case PeriodicNoteType.QuarterlyNote:
      return getQuarterlyNote(now, getAllQuarterlyNotes());

    case PeriodicNoteType.YearlyNote:
      return getYearlyNote(now, getAllYearlyNotes());
  }
}

export function getAllPeriodicNotes(
  periodicNoteType: PeriodicNoteType,
): Record<string, TFile> {
  switch (periodicNoteType) {
    case PeriodicNoteType.DailyNote:
      return getAllDailyNotes();

    case PeriodicNoteType.WeeklyNote:
      return getAllWeeklyNotes();

    case PeriodicNoteType.MonthlyNote:
      return getAllMonthlyNotes();

    case PeriodicNoteType.QuarterlyNote:
      return getAllQuarterlyNotes();

    case PeriodicNoteType.YearlyNote:
      return getAllYearlyNotes();
  }
}

export function checkForEnabledPeriodicNoteFeature(
  periodicNoteType: PeriodicNoteType,
): boolean {
  switch (periodicNoteType) {
    case PeriodicNoteType.DailyNote:
      return appHasDailyNotesPluginLoaded();

    case PeriodicNoteType.WeeklyNote:
      return appHasWeeklyNotesPluginLoaded();

    case PeriodicNoteType.MonthlyNote:
      return appHasMonthlyNotesPluginLoaded();

    case PeriodicNoteType.QuarterlyNote:
      return appHasQuarterlyNotesPluginLoaded();

    case PeriodicNoteType.YearlyNote:
      return appHasYearlyNotesPluginLoaded();
  }
}

export async function createPeriodicNote(
  periodicNoteType: PeriodicNoteType,
): Promise<TFile> {
  const now = moment();
  let newFile: Promise<TFile>;

  switch (periodicNoteType) {
    case PeriodicNoteType.DailyNote:
      newFile = createDailyNote(now);
      break;

    case PeriodicNoteType.WeeklyNote:
      newFile = createWeeklyNote(now);
      break;

    case PeriodicNoteType.MonthlyNote:
      newFile = createMonthlyNote(now);
      break;

    case PeriodicNoteType.QuarterlyNote:
      newFile = createQuarterlyNote(now);
      break;

    case PeriodicNoteType.YearlyNote:
      newFile = createYearlyNote(now);
      break;
  }

  if (
    isCorePluginEnabled("templates") ||
    isCommunityPluginEnabled("templater-obsidian")
  ) {
    await pause(500);
  }

  return newFile;
}

/**
 * Checks if the daily/weekly/monthly/etc periodic note feature is available,
 * and gets the path to the current related note.
 *
 * @returns Successful `StringResultObject` containing the path if the PN
 * functionality is available and there is a current daily note. Unsuccessful
 * `StringResultObject` if it isn't.
 */
export function getExistingPeriodicNotePathIfPluginIsAvailable(
  periodicNoteType: PeriodicNoteType,
): StringResultObject {
  if (!checkForEnabledPeriodicNoteFeature(periodicNoteType)) {
    return failure(
      ErrorCode.FeatureUnavailable,
      STRINGS[`${periodicNoteType}_note`].feature_not_available,
    );
  }

  const pNote = getCurrentPeriodicNote(periodicNoteType);
  return pNote
    ? success(pNote.path)
    : failure(ErrorCode.NotFound, STRINGS.note_not_found);
}
