# [Actions URI](README.md) ≫ Routes ≫ `/daily-note`
These routes deal with reading, writing and updating daily notes. Their URLs start with `obsidian://actions-uri/daily-note/…`.

All routes listed here will test whether Daily Note functionality is enabled in Obsidian and if not, will return an `x-error` callback.  Both the official core plugin and the [@liamcain](https://github.com/liamcain)'s community plugin [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes) are supported.  The configurations from those plugins is honored, i.e. date format, the set folder for daily notes etc. are taken into account when fetching, creating and updating notes.


## Root, i.e. `/daily-note`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |


&nbsp;


## `/daily-note/get-current`
Returns today's daily note.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter   | Value type | Optional? | Description                                                    |
| ----------- | ---------- |:---------:| -------------------------------------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                |
| `silent`    | boolean    |    ✅     | *"Do **not** open the note in Obsidian."* Defaults to `false`. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.   |
| `result-content`      | The entire content of the note file.                                     |
| `result-filepath`     | The file path of the note, relative from the vault root folder.          |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/get-most-recent`
Returns the most recent daily note.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter   | Value type | Optional? | Description                                                    |
| ----------- | ---------- |:---------:| -------------------------------------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                |
| `silent`    | boolean    |    ✅     | *"Do **not** open the note in Obsidian."* Defaults to `false`. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.   |
| `result-content`      | The entire content of the note file.                                     |
| `result-filepath`     | The file path of the note, relative from the vault root folder.          |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/create`
Creates a new daily note. In case of an already existing current daily note, it will be overwritten **only** if the related parameter is set.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter   | Value type | Optional? | Description                                                                              |
| ----------- | ---------- |:---------:| ---------------------------------------------------------------------------------------- |
| `content`   | string     |    ✅     | The initial body of the note                                                             |
| `overwrite` | boolean    |    ✅     | *"If today's daily note already exists, it should be overwritten."* Defaults to `false`. |
| `silent`    | boolean    |    ✅     | *"After creating the note, do **not** open it in Obsidian."* Defaults to `false`.        |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.   |
| `result-content`      | The entire content of the note file.                                     |
| `result-filepath`     | The file path of the note, relative from the vault root folder.          |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/append`
Appends today's daily note with a string.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter        | Value type | Optional? | Description                                                                       |
| ---------------- | ---------- |:---------:| --------------------------------------------------------------------------------- |
| `content`        | string     |           | The text to be added at the end of today's daily note.                                              |
| `ensure-newline` | boolean    |    ✅     | *"Make sure the note ends with a line break."* Defaults to `false`.               |
| `silent`         | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/prepend`
Prepends today's daily note with a string.  Front matter is honored (i.e. the new text will be added to the note body below the front matter) unless explicity stated otherwise.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter             | Value type | Optional? | Description                                                                                                   |
| --------------------- | ---------- |:---------:| ------------------------------------------------------------------------------------------------------------- |
| `content`             | string     |           | The text to be added at the beginning of today's daily note.                                                  |
| `ensure-newline`      | boolean    |    ✅     | *"Make sure the note ends with a line break."* Defaults to `false`.                                           |
| `ignore-front-matter` | boolean    |    ✅     | *"Put the text at the very beginning of the note file, even if there is front matter."*  Defaults to `false`. |
| `silent`              | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                             |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/search-string-and-replace`
Does text replacement in today's daily note.  The search term is used as-is, i.e. it's a string search.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter | Value type | Optional? | Description                                                                       |
| --------- | ---------- |:---------:| --------------------------------------------------------------------------------- |
| `search`  | string     |           | Text string that should be replaced.                                              |
| `replace` | string     |           | Replacement text.                                                                 |
| `silent`  | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |


&nbsp;


## `/daily-note/search-regex-and-replace`
Does text replacement in today's daily note.  The search term is used as a pattern, i.e. it's a regular expression search.

Capturing is supported. Example: the note contains the text *"and it was good"*, the `search` value is `/(it) (was)/` and the `replace` value is `$2 $1` — after the replacement the note would be changed to *"and was it good"*.

Modifiers for case-insensitive and global search (`/…/i`, `/…/g`, `/…/gi`) are supported as well. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#using_the_global_and_ignorecase_flags_with_replace) for examples.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter | Value type | Optional? | Description                                                                       |
| --------- | ---------- |:---------:| --------------------------------------------------------------------------------- |
| `search`  | string     |           | Text pattern that should be replaced.                                             |
| `replace` | string     |           | Replacement text.                                                                 |
| `silent`  | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                         |
| --------- | ----------------------------------- |
| `error`   | A short summary of what went wrong. |
