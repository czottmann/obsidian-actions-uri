export const URI_NAMESPACE = "actions-uri";

export const STRINGS = {
  append_done: "Note was appended",
  command_not_found: (command: string) => `Unknown command ${command}`,
  daily_note: {
    create_note_already_exists: "Daily note already exists",
    create_note_no_content:
      "Daily note couldn't be overwritten, no content specified",
    feature_not_available: "Daily Notes feature is not active",
  },
  dataview_dql_must_start_with_list: 'DQL must start with "LIST"',
  dataview_dql_must_start_with_table: 'DQL must start with "TABLE"',
  dataview_plugin_not_available: "Dataview plugin is not active",
  delete_done: "Successfully deleted",
  folder_created: "Folder created",
  global_search_feature_not_available: "Global Search plugin is not active",
  monthly_note: {
    create_note_already_exists: "Monthly note already exists",
    create_note_no_content:
      "Monthly note couldn't be overwritten, no content specified",
    feature_not_available: "Periodic Notes' Monthly feature is not active",
  },
  not_available_on_mobile: "This action is not available on mobile",
  not_found: "Not found",
  note_not_found: "Note couldn't be found",
  note_opened: "Note opened",
  omnisearch_plugin_not_available: "Omnisearch plugin is not active",
  prepend_done: "Note was prepended",
  properties: {
    key_not_found: "Key not found",
  },
  quarterly_note: {
    create_note_already_exists: "Quarterly note already exists",
    create_note_no_content:
      "Quarterly note couldn't be overwritten, no content specified",
    feature_not_available: "Periodic Notes' Quarterly feature is not active",
  },
  rename_done: "Note was renamed/moved",
  replacement_done: "Replacement done, note updated",
  search_pattern_empty: "Search pattern is empty",
  search_pattern_invalid: "Search pattern must start with a forward slash",
  search_pattern_not_found: "Search pattern wasn't found, nothing replaced",
  search_pattern_unparseable: "Search pattern is not correctly formed",
  search_string_not_found: "Search string wasn't found, nothing replaced",
  touch_done: "Successfully touched",
  trash_done: "Successfully moved to trash",
  unable_to_read_note: "Can't read note file",
  unable_to_write_note: "Can't write note file",
  vault_internals_not_found: "Vault didn't return config info",
  weekly_note: {
    create_note_already_exists: "Weekly note already exists",
    create_note_no_content:
      "Weekly note couldn't be overwritten, no content specified",
    feature_not_available: "Periodic Notes' Weekly feature is not active",
  },
  yearly_note: {
    create_note_already_exists: "Yearly note already exists",
    create_note_no_content:
      "Yearly note couldn't be overwritten, no content specified",
    feature_not_available: "Periodic Notes' Yearly feature is not active",
  },
};

export const PERIOD_IDS = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const XCALLBACK_RESULT_PREFIX = "result";
