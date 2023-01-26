# Release history

## 0.16.0, 2023-01-26
- [NEW] Adds [route `/note/delete`](https://czottmann.github.io/obsidian-actions-uri/routes/note/) for deleting a note [#30]
- [NEW] Adds [route `/note/rename`](https://czottmann.github.io/obsidian-actions-uri/routes/note/) for renaming or moving a note [#30]
- [NEW] Adds [route `/note/trash`](https://czottmann.github.io/obsidian-actions-uri/routes/note/) for moving a note to the trash [#30]
- [NEW] Adds [route `/folder/list`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) for fetching the list of available folders [#30]
- [NEW] Adds [route `/folder/create`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) for creating a new folder or folder structure [#30]
- [NEW] Adds [route `/folder/delete`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) for deleting a folder and all its contents [#30]
- [NEW] Adds [route `/folder/rename`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) for renaming or moving a folder [#30]
- [NEW] Adds [route `/folder/trash`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) for moving a folder to the trash [#30]
- [DEL] Deprecates route [`/vault/list-folders`](https://czottmann.github.io/obsidian-actions-uri/routes/vault/) in favor of [`/folder/list`](https://czottmann.github.io/obsidian-actions-uri/routes/folder/) [#30]


## 0.15.0, 2022-12-31
- [NEW] Adds extra return params for use by [Actions for Obsidian](https://obsidian.actions.work) [#26]
- [CHG] Root routes (e.g., `/`, `/note`, `/daily-note`) return a non-empty result message
- [FIX] Addresses endless loop in string search/replace routes which would occur when the replacement included the search term [#28]

Have a wondrous 2023, people 🚀


## 0.14.2, 2022-12-16
- [NEW] Adds [Dataview support for `TABLE` and `LIST` queries](https://czottmann.github.io/obsidian-actions-uri/routes/dataview/) [#4]
- [NEW] Adds [route `/tags/list`](https://czottmann.github.io/obsidian-actions-uri/routes/tags/) for fetching a list of all existing tags [#16]
- [NEW] Adds [route `/note/list`](https://czottmann.github.io/obsidian-actions-uri/routes/note/) for fetching the list of available Markdown files [#24]
- [NEW] Adds [route `/vault/list-folders`](https://czottmann.github.io/obsidian-actions-uri/routes/vault/) for fetching the list of available folders [#24]
- [NEW] Adds [route `/vault/list-non-notes-files`](https://czottmann.github.io/obsidian-actions-uri/routes/vault/) for fetching list of non-Markdown files [#24]
- [NEW] Adds [route `/vault/list-all-files`](https://czottmann.github.io/obsidian-actions-uri/routes/vault/) for fetching all files present in a vault [#24]
- [CHG] Adjusts [route `/daily-note/list`](https://czottmann.github.io/obsidian-actions-uri/routes/daily-note/) to return the same structure as its `/note/list` counterpart
- [FIX] Notes returned will now always contain the four return parameters `result-content`, `result-body`, `result-front-matter` and `result-filepath` [#22]
- [FIX] Adds missing links to route docs detail pages


## 0.13.0, 2022-12-07
- [NEW] Adds `tags/list` route [#16]
- [NEW] Adds `vault/info` route [#20]
- [CHG] Makes `vault/close` desktop-only (due to the different Obsidian foundations on mobile and desktop)
- [CHG] Replaces Twitter links w/ Mastodon links in docs


## 0.12.1, 2022-11-23
- [NEW] Added `/vault/open` and `/vault/close` routes [#18]
- [CHG] Error callbacks now carry two parameters, `errorCode` and `errorMessage`, instead of just `error`.
- [CHG] The routes `note/open` and `daily-note/open` supersede `open/note` and `open/daily-note` respectively.  The old routes have been removed.
- [FIX] Creating a note would sometimes result in the creation of a folder and an error [#16]
- [FIX] Searching/replacing a string would result in an error if the search term looked like a regex [#15]


## 0.11.0, 2022-11-07
- [NEW] Refactors error callback parameters [#12]
- [CHG] Replaces all occurrences of `global.app` [#14]
- [CHG] Changes spaces in callback URLs from plus-sign- to percent-encoding [#11]
- [DEL] Removes support for `call-id` parameter [#7]
- [CHG] Drops support for Obsidian <v1.0


## 0.10.6, 2022-10-12

- Fixes outdated success checks in main file handling methods — due to the
  broken check successful file operations weren't recognized as such. Sorry!


## 0.10.5, 2022-10-01

- Initial pre-1.0 release. Let's get this show on the road! 🚀
