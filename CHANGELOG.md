# Release history

## 1.6.3, 2024-08-02

### No longer broken

- When calling `/*-note/create` with a `template-file` parameter, the template wouldn't be found unless the template path contained both folder and file extension. Fixed! <!-- ZCO-642 -->




## 1.6.2, 2024-07-29

### No longer broken

- When a note couldn't be found, the wrong error code would be returned (500 instead of 404). <!-- ZCO-636 -->
- Appending/prepending below a headline could fail if either the input headline or the headline in the note contained trailing whitespace. This is now fixed by ignoring trailing whitespace when checking, appending, and prepending. <!-- ZCO-634 -->




## 1.6.1, 2024-07-25

### No longer broken

- Under some circumstances, [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate) with `apply=content` would not create a note. Sorry about that! <!-- ZCO-633 -->




## 1.6.0, 2024-07-23

### New stuff

- All [`/note` routes](https://zottmann.dev/obsidian-actions-uri/routes/note/) gained support for working with periodic notes (daily, weekly, etc.).
- All [`/note` routes](https://zottmann.dev/obsidian-actions-uri/routes/note/) gained support for UID-based note references. Notes can now be referenced by their UID instead of their file path, so if you're storing a UID in your front matter, give it a go. Make sure to check that the correct frontmatter key is configured in the …
- New settings UI. The plugin now has a settings page in Obsidian's settings.
- [`/note/get-active-note`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteget-active) returns the current selection as part of its result. (Plain-text only for now.) Thanks to [@FelipeRearden](https://github.com/FelipeRearden) for the suggestion! [#90] <!-- ZCO-629 -->
- [`/note-properties`](https://zottmann.dev/obsidian-actions-uri/routes/note-properties/) now supports working with current periodic notes (daily, weekly, etc.)
- When using [`/note/append`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteappend) or [/note/prepend](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteprepend) to insert text below a headline, the route no longer joyfully reports success even when the headline couldn't be found. Instead, the routes now support a conditional `if-headline-missing` parameter to specify what to do in that case: report an error (the new default), skip the operation (the old default behavior), or add the headline to the end of the note. Thanks to [@vitaly-rudenko](https://github.com/vitaly-rudenko) for the bug report! [#91] <!-- ZCO-630 -->

### Deprecation notice

All dedicated periodic note-related routes (`/daily-note/*`, `/weekly-note/*`, `/monthly-note/*`, `/quarterly-note/*`, `/yearly-note/*`) are officially deprecated, and will be removed in early 2025. Please update your scripts accordingly.

There will be no further work on these routes going forward.

### No longer broken

- Fixes search/replace in notes, which wouldn't work if the search term was a string but contained regex-like characters (`$`, `^`, etc.) <!-- ZCO-606 -->
- [`/note-properties/get`](https://zottmann.dev/obsidian-actions-uri/routes/note-properties/#note-propertiesget) won't automatically open the note anymore.
- Fixes template path handling in [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate), which was very strict, and didn't allow for specifying a template file outside the configured template folder. <!-- ZCO-480 -->




## 1.5.3, 2024-06-18

### No longer broken

- Fixes the plugin not sending out return calls when the requested vault wasn't loaded yet, e.g. when Obsidian wasn't running or when another vault was active.




## 1.5.2, 2024-05-11

House keeping release, no new features.

### Changes

- Replaces deprecated `global.app` references
- Sets minimum Obsidian version to 1.5.0




## 1.5.1, 2024-03-27

### Changes

- `/note/create/`, `/periodic-note/create`: If the file name passed in `template-file` can't be found, the plugin will now check the template folder set in Templates or Templater, respectively, before returning an error.
- Console output will now print the paths contained in the incoming params, instead of their internal file references. This prevents circular references and "max call stack" errors related to files when using [Logstravaganza](https://github.com/czottmann/obsidian-logstravaganza).




## 1.5.0, 2024-02-19

### New stuff

- New route path: [`/file`](https://zottmann.dev/obsidian-actions-uri/routes/file/) for working with files. The Obsidian API doesn't allow for uploading attachment files, but now you can at least handle them. (#85)
  - `/file/list`: Returns the paths of all files in the vault.
  - `/file/get-active`: Return the path of the currently active/ focussed file.
  - `/file/open`: Opens a file in Obsidian.
  - `/file/delete`: Deletes a file.
  - `/file/trash`: Moves a file to the trash.
  - `/file/rename`: Renames a file.
- New route: [`/note/get-active`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteget-active) returns the currently active/ focussed note.
- New route: [`/note/get-first-named`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteget-first-named) returns the first note found with a given name.
- New route: [`/note/touch`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notetouch) sets the modification date of a note to the current date and time (side effect: it makes Obsidian reload it in views/ embeddings).

### Changes

- Appending below headline: Now inserts before any trailing new lines in a section instead of after them.
- Changed route: [`/command/execute`](https://zottmann.dev/obsidian-actions-uri/routes/command/#commandexecute) no longer requires the `x-success` and `x-error` parameters to be present. If they are, they will be used, but they are optional now. (#84)
- Removed route: `/vault/list-folders` was marked as deprecated in 0.16, and is now gone for good. Use [`/folder/list`](https://zottmann.dev/obsidian-actions-uri/routes/folder/#folderlist) instead.




## 1.4.2, 2023-12-12

### No longer broken

- Resolves problems with applying templates of the core plugin Templates.
- Fixes broken handling of `silent` parameter in `note/*`, `daily-note/*`, `weekly-note/*`, `monthly-note/*`, `quarterly-note/*`, and `yearly-note/*` routes




## 1.4.0, 2023-11-22

### New stuff

#### Support for Note Properties (ZCO-28)

[Properties](https://help.obsidian.md/Editing+and+formatting/Properties) are a core feature of Obsidian: structured data containing information about a note. Actions URI now supports them in a variety of ways. Please see the new route docs for details:

- [`/note-properties`](https://zottmann.dev/obsidian-actions-uri/routes/note-properties/)

Existing routes which return note content now also return note properties, if present. Their documentation has been updated accordingly. See Changes, below.

### Changes

Actions URI now requires Obsidian 1.4+.

The following routes return an additional `result-properties` parameter if the note contains properties:

- [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate)
- [`/note/get`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteget)
- [`/daily-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-notecreate)
- [`/daily-note/get-current`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteget-current)
- [`/daily-note/get-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteget-most-recent)
- [`/weekly-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/weekly-note/#weekly-notecreate)
- [`/weekly-note/get-current`](https://zottmann.dev/obsidian-actions-uri/routes/weekly-note/#weekly-noteget-current)
- [`/weekly-note/get-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/weekly-note/#weekly-noteget-most-recent)
- [`/monthly-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/monthly-note/#monthly-notecreate)
- [`/monthly-note/get-current`](https://zottmann.dev/obsidian-actions-uri/routes/monthly-note/#monthly-noteget-current)
- [`/monthly-note/get-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/monthly-note/#monthly-noteget-most-recent)
- [`/quarterly-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/quarterly-note/#quarterly-notecreate)
- [`/quarterly-note/get-current`](https://zottmann.dev/obsidian-actions-uri/routes/quarterly-note/#quarterly-noteget-current)
- [`/quarterly-note/get-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/quarterly-note/#quarterly-noteget-most-recent)
- [`/yearly-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/yearly-note/#yearly-notecreate)
- [`/yearly-note/get-current`](https://zottmann.dev/obsidian-actions-uri/routes/yearly-note/#yearly-noteget-current)
- [`/yearly-note/get-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/yearly-note/#yearly-noteget-most-recent)




## 1.3.1, 2023-10-09

### Fixes

- Append/prepend to a periodic note that had to be created first would create the note but fail to append/prepend the text. This is now fixed.




## 1.3.0, 2023-09-04

### New stuff

#### Support for triggering Obsidian commands (#77)

Please see the new route docs for details:

- [`/command`](https://zottmann.dev/obsidian-actions-uri/routes/command/)

#### Support for Weekly, Monthly, Quarterly, and Yearly Notes (#75)

All of Action UR's existing [`/daily-note`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/) functionality is now also available for anything supported by the [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes) community plugin! Please see the new route docs for details:

- [`/weekly-note`](https://zottmann.dev/obsidian-actions-uri/routes/weekly-note/)
- [`/monthly-note`](https://zottmann.dev/obsidian-actions-uri/routes/monthly-note/)
- [`/quarterly-note`](https://zottmann.dev/obsidian-actions-uri/routes/quarterly-note/)
- [`/yearly-note`](https://zottmann.dev/obsidian-actions-uri/routes/yearly-note/)

> [!IMPORTANT] > **Known issue:** At the time of writing, the Periodic Notes plugin seems to have a bug that (for some people) prevents creating a new weekly note on any day other than Sunday. [liamcain/obsidian-periodic-notes · #185 · Open weekly note only works on Sunday](https://github.com/liamcain/obsidian-periodic-notes/issues/185). Since Actions URI uses the Periodic Notes plugin's API, this is not something I can fix. Please follow the issue for updates.

### Changes

- Actions URI now requires Obsidian 1.3+ .

### Fixes

- Adds missing return calls to `/vault/open` and `/vault/close`. (#76)
- For some Dataview `TABLE` queries, the results would be wrapped in an extra array, this has been fixed. (#79)

### Housekeeping

- Updates esbuild and @typescript-eslint packages.




## 1.2.5, 2023-08-29

### Fixes

- Ensures Dataview `TABLE` results are correctly nested. (#79)




## 1.2.4, 2023-08-07

### Fixes

- Appending/prepending below headlines no longer fails if there is no empty line below the headline. (#73)
- When using a file path ending in `.canvas`, Actions URI will no longer add `.md` to it. (#74)




## 1.2.3, 2023-07-25

### Fixes

- Attempting to use the Templates core plugin on iOS would result in an error. This is now fixed.




## 1.2.2, 2023-07-13

### Fixes

- Adjusts the behavior of [`/note/get`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteget) so it no longer breaks Actions for Obsidian's "Check if note exists" action. 😬
- Fixes a bug in note creation where the default behavior regarding content insertion was not respected.




## 1.2.0, 2023-07-12

### New stuff

#### [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate)

- Adds support for applying a Templates (core plugin) template or Templater (community plugin) template after note creation (#69)

#### [`/note/append`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteappend)

- Adds an optional `create-if-not-found` parameter for avoiding errors if the note doesn't exist yet (#67)
- Adds an optional `below-headline` parameter for appending text not to the end of a file but to a section below a heading (#68)

#### [`/note/prepend`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteprepend)

- Adds an optional `create-if-not-found` parameter for avoiding errors if the note doesn't exist yet (#67)
- Adds an optional `below-headline` parameter for prepending text not to the beginning of a file but to a section below a heading (#68)

#### [`/daily-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-notecreate)

- Adds support for applying a Templates (core plugin) template or Templater (community plugin) template after note creation (#69)

#### [`/daily-note/append`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteappend)

- Adds an optional `create-if-not-found` parameter for avoiding errors if the note doesn't exist yet (#67)
- Adds an optional `below-headline` parameter for appending text not to the end of a file but to a section below a heading (#68)

#### [`/daily-note/prepend`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteprepend)

- Adds an optional `create-if-not-found` parameter for avoiding errors if the note doesn't exist yet (#67)
- Adds an optional `below-headline` parameter for prepending text not to the beginning of a file but to a section below a heading (#68)

### Changes

- Incoming, malformed calls are now answered if possible: if an `x-error` parameter was passed in, it will be used now, instead of Actions URI just doing nothing. (#72)
- `file` & `folder` parameter validation is now more strict where the parameter is supposed to reference an existing path, and will return a "bad request" error if the referenced file/folder couldn't be found. Examples for clarification: `file` in `/note/rename`, `folder` in `/folder/delete`; but **not** `file` in `/note/create` (as here the parameter references a file yet to be created). (#72)

### Removals

- The deprecations made in 0.18.0 are now feasting with the Gods.




## 1.1.2, 2023-05-10

This is a minor release aimed at fixing an issue with opening notes after creation that came up during the [Actions for Obsidian](https://obsidian.actions.work) iOS TestFlight.

- [FIX] Cleans up opening/focussing notes
- [DEL] Removes outdated API references




## 1.1.0, 2023-05-04

The plugin is stable enough and used in production as the companion plugin to my macOS/iOS app [Actions for Obsidian](https://obsidian.actions.work). So the version number took a big leap to bring it mostly in line with the app. **Nothing else will change,** Actions URI will remain FOSS under a MIT License.

### New stuff

- If you're unhappy with the global search, and use Omnisearch, you'll be delighted about the [new `/omnisearch` routes](https://zottmann.dev/obsidian-actions-uri/routes/omnisearch/) (#59)
- Actions URI should now handle unexpected exceptions outside its control more graceful (#60)
- I've added table of contents to [the route pages in the documentation](https://zottmann.dev/obsidian-actions-uri/routes/).

### No longer broken

- Adds code for preventing a race condition in vaults w/ Templater enabled (#61)




## 0.18.0, 2023-04-14

### New stuff

The [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate) route
has a new optional `if-exists` parameter to specify a strategy for dealing with an existing note. It
overrides the default behavior (creating a new note by appending a numeric suffix to the base name)
and can be set to `skip` or `overwrite`. `if-exists=skip` will not create another note and instead
return the named note as-is. `if-exists=overwrite` will replace the existing note with a new one.

The[`/daily-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-notecreate)
route has a new optional `if-exists` parameter to specify a strategy for dealing with an existing
current daily note. It overrides the default behavior (returning an error) and can be set to `skip`
or `overwrite`. `if-exists=skip` will pretend the existing note was just created and return it.
`if-exists=overwrite` will trash the existing note and create a new daily note from scratch.

### Changes

- [`/note/create`](https://zottmann.dev/obsidian-actions-uri/routes/note/#notecreate): the
  `overwrite` parameter is deprecated and will be removed in a future release. Use
  `if-exists=overwrite` instead.
- [`/daily-note/create`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-notecreate):
  the `overwrite` parameter is deprecated and will be removed in a future release. Use
  `if-exists=overwrite` instead.




## 0.17.0, 2023-04-12

- [FIX] Normalizes leading/trailing whitespace in path segments (#54)
- [CHG] Moves route `/open/search` → [`/search/open`](https://zottmann.dev/obsidian-actions-uri/routes/search/) (#17)
- [DOC] Marks route `/open/search` as deprecated (#17)
- [DOC] Removes docs for previously removed `/open/*` routes (#17)
- [DOC] Corrects docs to reflect reality (#55)
- [DOC] Corrects docs where callbacks are optional, not required (#55)
  - [`/note/open`](https://zottmann.dev/obsidian-actions-uri/routes/note/#noteopen-v012)
  - [`/daily-note/open-current`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteopen-current-v012)
  - [`/daily-note/open-most-recent`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/#daily-noteopen-most-recent-v012)




## 0.16.4, 2023-02-15

- [CHG] Increases time waiting for search results in `/search/all-notes` to 2s (#50)




## 0.16.3, 2023-02-06

- [FIX] Fixes handling of backslashes and colon characters in file names (#43)




## 0.16.2, 2023-01-30

- [CHG] Shortens `*/rename` error messages




## 0.16.1, 2023-01-28

- [FIX] Adds graceful handling of the default "Default location for new notes" configuration setting (#41)




## 0.16.0, 2023-01-26

- [NEW] Adds [route `/note/delete`](https://zottmann.dev/obsidian-actions-uri/routes/note/) for deleting a note (#30)
- [NEW] Adds [route `/note/rename`](https://zottmann.dev/obsidian-actions-uri/routes/note/) for renaming or moving a note (#30)
- [NEW] Adds [route `/note/trash`](https://zottmann.dev/obsidian-actions-uri/routes/note/) for moving a note to the trash (#30)
- [NEW] Adds [route `/folder/list`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) for fetching the list of available folders (#30)
- [NEW] Adds [route `/folder/create`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) for creating a new folder or folder structure (#30)
- [NEW] Adds [route `/folder/delete`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) for deleting a folder and all its contents (#30)
- [NEW] Adds [route `/folder/rename`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) for renaming or moving a folder (#30)
- [NEW] Adds [route `/folder/trash`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) for moving a folder to the trash (#30)
- [DEL] Deprecates route [`/vault/list-folders`](https://zottmann.dev/obsidian-actions-uri/routes/vault/) in favor of [`/folder/list`](https://zottmann.dev/obsidian-actions-uri/routes/folder/) (#30)




## 0.15.0, 2022-12-31

- [NEW] Adds extra return params for use by [Actions for Obsidian](https://obsidian.actions.work) (#26)
- [CHG] Root routes (e.g., `/`, `/note`, `/daily-note`) return a non-empty result message
- [FIX] Addresses endless loop in string search/replace routes which would occur when the replacement included the search term (#28)

Have a wondrous 2023, people 🚀




## 0.14.2, 2022-12-16

- [NEW] Adds [Dataview support for `TABLE` and `LIST` queries](https://zottmann.dev/obsidian-actions-uri/routes/dataview/) (#4)
- [NEW] Adds [route `/tags/list`](https://zottmann.dev/obsidian-actions-uri/routes/tags/) for fetching a list of all existing tags (#16)
- [NEW] Adds [route `/note/list`](https://zottmann.dev/obsidian-actions-uri/routes/note/) for fetching the list of available Markdown files (#24)
- [NEW] Adds [route `/vault/list-folders`](https://zottmann.dev/obsidian-actions-uri/routes/vault/) for fetching the list of available folders (#24)
- [NEW] Adds [route `/vault/list-non-notes-files`](https://zottmann.dev/obsidian-actions-uri/routes/vault/) for fetching list of non-Markdown files (#24)
- [NEW] Adds [route `/vault/list-all-files`](https://zottmann.dev/obsidian-actions-uri/routes/vault/) for fetching all files present in a vault (#24)
- [CHG] Adjusts [route `/daily-note/list`](https://zottmann.dev/obsidian-actions-uri/routes/daily-note/) to return the same structure as its `/note/list` counterpart
- [FIX] Notes returned will now always contain the four return parameters `result-content`, `result-body`, `result-front-matter` and `result-filepath` (#22)
- [FIX] Adds missing links to route docs detail pages




## 0.13.0, 2022-12-07

- [NEW] Adds `tags/list` route (#16)
- [NEW] Adds `vault/info` route (#20)
- [CHG] Makes `vault/close` desktop-only (due to the different Obsidian foundations on mobile and desktop)
- [CHG] Replaces Twitter links w/ Mastodon links in docs




## 0.12.1, 2022-11-23

- [NEW] Added `/vault/open` and `/vault/close` routes (#18)
- [CHG] Error callbacks now carry two parameters, `errorCode` and `errorMessage`, instead of just `error`.
- [CHG] The routes `note/open` and `daily-note/open` supersede `open/note` and `open/daily-note` respectively. The old routes have been removed.
- [FIX] Creating a note would sometimes result in the creation of a folder and an error (#16)
- [FIX] Searching/replacing a string would result in an error if the search term looked like a regex (#15)




## 0.11.0, 2022-11-07

- [NEW] Refactors error callback parameters (#12)
- [CHG] Replaces all occurrences of `global.app` (#14)
- [CHG] Changes spaces in callback URLs from plus-sign- to percent-encoding (#11)
- [DEL] Removes support for `call-id` parameter (#7)
- [CHG] Drops support for Obsidian <v1.0




## 0.10.6, 2022-10-12

- Fixes outdated success checks in main file handling methods — due to the
  broken check successful file operations weren't recognized as such. Sorry!




## 0.10.5, 2022-10-01

- Initial pre-1.0 release. Let's get this show on the road! 🚀
