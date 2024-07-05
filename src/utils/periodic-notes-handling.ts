import { TFile } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  appHasMonthlyNotesPluginLoaded,
  appHasQuarterlyNotesPluginLoaded,
  appHasWeeklyNotesPluginLoaded,
  appHasYearlyNotesPluginLoaded,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllQuarterlyNotes,
  getAllWeeklyNotes,
  getAllYearlyNotes,
  getDailyNote,
  getMonthlyNote,
  getQuarterlyNote,
  getWeeklyNote,
  getYearlyNote,
} from "obsidian-daily-notes-interface";
import { STRINGS } from "../constants";
import { PeriodType, StringResultObject, TFileResultObject } from "../types";
import { getNote } from "../utils/file-handling";
import { failure, success } from "../utils/results-handling";

/**
 * Checks if the daily/weekly/monthly/etc periodic note feature is available,
 * and gets the path to the current related note.
 *
 * @returns Successful `StringResultObject` containing the path if the PN
 * functionality is available and there is a current daily note. Unsuccessful
 * `StringResultObject` if it isn't.
 */
export function getPeriodNotePathIfPluginIsAvailable(
  periodID: PeriodType,
): StringResultObject {
  var pluginLoadedCheck: () => boolean;
  var getCurrentPeriodNote: () => TFile;
  const now = window.moment();

  switch (periodID) {
    case "daily":
      pluginLoadedCheck = appHasDailyNotesPluginLoaded;
      getCurrentPeriodNote = () => getDailyNote(now, getAllDailyNotes());
      break;

    case "weekly":
      pluginLoadedCheck = appHasWeeklyNotesPluginLoaded;
      getCurrentPeriodNote = () => getWeeklyNote(now, getAllWeeklyNotes());
      break;

    case "monthly":
      pluginLoadedCheck = appHasMonthlyNotesPluginLoaded;
      getCurrentPeriodNote = () => getMonthlyNote(now, getAllMonthlyNotes());
      break;

    case "quarterly":
      pluginLoadedCheck = appHasQuarterlyNotesPluginLoaded;
      getCurrentPeriodNote = () =>
        getQuarterlyNote(now, getAllQuarterlyNotes());
      break;

    case "yearly":
      pluginLoadedCheck = appHasYearlyNotesPluginLoaded;
      getCurrentPeriodNote = () => getYearlyNote(now, getAllYearlyNotes());
      break;
  }

  if (!pluginLoadedCheck()) {
    return failure(412, STRINGS[`${periodID}_note`].feature_not_available);
  }

  const pNote = getCurrentPeriodNote();
  return pNote ? success(pNote.path) : failure(404, STRINGS.note_not_found);
}

export function getCurrentPeriodNote(periodID: PeriodType): TFile | undefined {
  const now = window.moment();

  switch (periodID) {
    case "daily":
      return getDailyNote(now, getAllDailyNotes());

    case "weekly":
      return getWeeklyNote(now, getAllWeeklyNotes());

    case "monthly":
      return getMonthlyNote(now, getAllMonthlyNotes());

    case "quarterly":
      return getQuarterlyNote(now, getAllQuarterlyNotes());

    case "yearly":
      return getYearlyNote(now, getAllYearlyNotes());
  }
}

export async function getMostRecentPeriodNote(
  periodID: PeriodType,
): Promise<TFileResultObject> {
  if (!appHasPeriodPluginLoaded(periodID)) {
    return failure(412, STRINGS[`${periodID}_note`].feature_not_available);
  }

  const notes = getAllPeriodNotes(periodID);
  const mostRecentKey = Object.keys(notes).sort().last();
  if (!mostRecentKey) {
    return failure(404, STRINGS.note_not_found);
  }

  const pNote = notes[mostRecentKey];
  return await getNote(pNote.path);
}

export function getAllPeriodNotes(periodID: PeriodType): Record<string, TFile> {
  switch (periodID) {
    case "daily":
      return getAllDailyNotes();

    case "weekly":
      return getAllWeeklyNotes();

    case "monthly":
      return getAllMonthlyNotes();

    case "quarterly":
      return getAllQuarterlyNotes();

    case "yearly":
      return getAllYearlyNotes();
  }
}

export function appHasPeriodPluginLoaded(periodID: PeriodType): boolean {
  switch (periodID) {
    case "daily":
      return appHasDailyNotesPluginLoaded();

    case "weekly":
      return appHasWeeklyNotesPluginLoaded();

    case "monthly":
      return appHasMonthlyNotesPluginLoaded();

    case "quarterly":
      return appHasQuarterlyNotesPluginLoaded();

    case "yearly":
      return appHasYearlyNotesPluginLoaded();
  }
}
