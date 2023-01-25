---
parent: New Routes
---

# `/note`

These routes deal with reading, writing and updating notes.  Their URLs start with `obsidian://actions-uri/note/…`.


&nbsp;


## Root, i.e. `/note`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |


&nbsp;


## `/note/list` <span class="tag tag-version">v0.14+</span>
Returns a list of all notes (Markdown files) in the vault.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter      | Description                                             |
| -------------- | ------------------------------------------------------- |
| `result-paths` | Array containing all file paths encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/get`
Returns a specific note.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                    |
| ----------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`      | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string     |           | base URL for on-success callbacks                                                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                                                |
| `silent`    | boolean    |    ✅     | *"Do **not** open the note in Obsidian."* Defaults to `false`.                                 |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.   |
| `result-content`      | The entire content of the note file.                                     |
| `result-filepath`     | The file path of the note, relative from the vault root folder.          |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/open` <span class="tag tag-version">v0.12+</span>
Opens a specific note in Obsidian.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                    |
| ----------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`      | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string     |           | base URL for on-success callbacks                                                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                                                |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/create`
Creates a new note. In case there's already a note with the same name / at the requested file path, it will be overwritten **only** if the related parameter is set.  Otherwise, the base file name will be suffixed with a number: if the desired file name is `My Note.md` but that file already exists, the note will be saved as `My Note 1.md`; if the desired file `a/Folder/Another Note 17.md` already exists, the note will be saved under `a/Folder/Another Note 18.md`.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                    |
| ----------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`      | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `content`   | string     |    ✅     | The initial body of the note                                                                   |
| `overwrite` | boolean    |    ✅     | *"If this note file already exists, it should be overwritten."* Defaults to `false`.           |
| `silent`    | boolean    |    ✅     | *"After creating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter             | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.   |
| `result-content`      | The entire content of the note file.                                     |
| `result-filepath`     | The file path of the note, relative from the vault root folder.          |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/append`
Appends a note with a string.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter        | Value type | Optional? | Description                                                                                    |
| ---------------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`           | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `content`        | string     |           | The text to be added at the end of the note.                                                   |
| `ensure-newline` | boolean    |    ✅     | *"Make sure the note ends with a line break."* Defaults to `false`.                            |
| `silent`         | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/prepend`
Prepends a note with a string.  Front matter is honored (i.e. the new text will be added to the note body below the front matter) unless explicitly stated otherwise.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                                   |
| --------------------- | ---------- |:---------:| ------------------------------------------------------------------------------------------------------------- |
| `file`                | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.                |
| `content`             | string     |           | The text to be added at the beginning of the note.                                                            |
| `ensure-newline`      | boolean    |    ✅     | *"Make sure the note ends with a line break."* Defaults to `false`.                                           |
| `ignore-front-matter` | boolean    |    ✅     | *"Put the text at the very beginning of the note file, even if there is front matter."*  Defaults to `false`. |
| `silent`              | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                             |


### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/search-string-and-replace`
Does text replacement in a note.  The search term is used as-is, i.e. it's a string search.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `search`  | string     |           | Text string that should be replaced.                                                           |
| `replace` | string     |           | Replacement text.                                                                              |
| `silent`  | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/search-regex-and-replace`
Does a text replacement in a note.  The search term is used as a pattern, i.e. it's a regular expression search.

Capturing is supported. Example: the note contains the text *"and it was good"*, the `search` value is `/(it) (was)/` and the `replace` value is `$2 $1` — after the replacement the note would be changed to *"and was it good"*.

Modifiers for case-insensitive and global search (`/…/i`, `/…/g`, `/…/gi`) are supported as well. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#using_the_global_and_ignorecase_flags_with_replace) for examples.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `search`  | string     |           | Text pattern that should be replaced.                                                          |
| `replace` | string     |           | Replacement text.                                                                              |
| `silent`  | boolean    |    ✅     | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/delete` <span class="tag tag-version">v0.16+</span>
Immediately deletes a specific note or folder.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                                  |
| ----------- | ---------- |:---------:| ------------------------------------------------------------------------------------------------------------ |
| `file`      | string     |           | The file path of the note or the folder, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string     |           | base URL for on-success callbacks                                                                            |
| `x-error`   | string     |           | base URL for on-error callbacks                                                                              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description              |
| ---------------- | ------------------------ |
| `result-message` | A short success message. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/trash` <span class="tag tag-version">v0.16+</span>
Moves a specific note or folder to the trash (either vault-local trash or system trash, depending on the configuration made in _Settings_ → _Files & Links_ → _Deleted Files_).

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                                  |
| ----------- | ---------- |:---------:| ------------------------------------------------------------------------------------------------------------ |
| `file`      | string     |           | The file path of the note or the folder, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string     |           | base URL for on-success callbacks                                                                            |
| `x-error`   | string     |           | base URL for on-error callbacks                                                                              |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description              |
| ---------------- | ------------------------ |
| `result-message` | A short success message. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |
