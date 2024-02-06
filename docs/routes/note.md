---
parent: New Routes
---

# `/note`

These routes deal with reading, writing and updating notes.  Their URLs start with `obsidian://actions-uri/note/…`.

<div id="toc"></div>


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


## `/note/list`
<span class="tag tag-version">v0.14+</span>
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

**Please note:** `result-properties` might be empty if Obsidian can't process the note's front matter. This can happen if the front matter is malformed or if the note contains a YAML block that is not front matter.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                                                    |
| ----------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`      | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string     |           | base URL for on-success callbacks                                                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                                                |
| `silent`    | boolean    | optional  | *"Do **not** open the note in Obsidian."* Defaults to `false`.                                 |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter             | Description                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.                                                          |
| `result-content`      | The entire content of the note file.                                                                                            |
| `result-filepath`     | The file path of the note, relative from the vault root folder.                                                                 |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body.                                                        |
| `result-properties`   | <span class="tag tag-version">v1.4+</span> The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/get-active`
<span class="tag tag-version">v1.5+</span>
Returns the currently focussed note. If there is no open note or the currently focussed file is not a note, an error 404 is returned.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                       |
| ----------- | ---------- | :-------: | ----------------------------------|
| `x-success` | string     |           | base URL for on-success callbacks |
| `x-error`   | string     |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter             | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.               |
| `result-content`      | The entire content of the note file.                                                 |
| `result-filepath`     | The file path of the note, relative from the vault root folder.                      |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body.             |
| `result-properties`   | The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/open`
<span class="tag tag-version">v0.12+</span>
Opens a specific note in Obsidian.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |

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
Creates a new note. The default behavior in case there's already a note with the same name / at the requested file path, the base file name will be suffixed with a number. For example, if the desired file name is `My Note.md` but that file already exists, the note will be saved as `My Note 1.md`; if the desired file `a/Folder/Another Note 17.md` already exists, the note will be saved under `a/Folder/Another Note 18.md`.

<span class="tag tag-version">v0.18+</span> If you want to prevent the creation of an additional note as described above, pass in `if-exists=skip`. If you want to overwrite an existing note, pass in `if-exists=overwrite`.

<span class="tag tag-version">v1.2.0</span> The `apply` parameter allows you to specify what to add to the note after creation. Available options are `content` (implied default) for adding a string, `templates` (for using the Template core plugin), `templater` (for using the Templater community plugin). Depending on the `apply` parameter's value, the following additional parameters are allowed:

- `apply=content` or no `apply` parameter: `content` parameter, the initial body of the note
- `apply=templater`: `template-file` parameter, path of the template file to apply
- `apply=templates`: `template-file` parameter, path of the template file to apply

Examples:

- `apply=content&content=Hello%20world!` or `content=Hello%20world!` (as `apply=content` is the default)
- `apply=templater&template-file=Templates/Meeting%20notes.md`
- `apply=templates&template-file=Templates/Meeting%20notes.md`

<span class="tag tag-version">v1.4+</span> **Please note:** `result-properties` might be empty if Obsidian can't process the note's front matter. This can happen if the front matter is malformed or if the note contains a YAML block that is not front matter.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter          | Value type | Optional? | Description                                                                                                                     |
| ------------------ | ---------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------- |
| `file`             | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.                                  |
| `apply`            | enum       | optional  | What to add to the note after creation. Available options: `content` (implied default), `templates`, `templater`.               |
| +- `content`       | string     | optional  | The initial body of the note. **Prerequisite:** no `apply` parameter or `apply=content`.                                        |
| +- `template-file` | string     | optional  | The path of the template file to apply. **Prerequisite:** `apply=templater` or `apply=templates`.                               |
| `if-exists`        | string     | optional  | What to do if the specified note exists. Set to `overwrite` for replacing the note or `skip` for using the existing note as-is. |
| `silent`           | boolean    | optional  | *"After creating the note, do **not** open it in Obsidian."* Defaults to `false`.                                               |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter             | Description                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `result-body`         | The note body, i.e. the note file content minus possible front matter.                                                          |
| `result-content`      | The entire content of the note file.                                                                                            |
| `result-filepath`     | The file path of the note, relative from the vault root folder.                                                                 |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body.                                                        |
| `result-properties`   | <span class="tag tag-version">v1.4+</span> The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/note/append`
Appends text to a note, either to the very end of the note (default) or to the section below a particular headline in a note.

When you want to append text to a section below a headline, the headline must be entered *exactly* as it appears in the note: headline levels, capitalization, punctuation etc. For example, "## My Headline", "### My Headline", and "## my headline" are not identical.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                                                              |
| --------------------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.                                           |
| `content`             | string     |           | The text to be added at the end of the note.                                                                                             |
| `below-headline`      | string     | optional  | Appends text below the given headline, before the next headline or EOF, whatever comes first. <span class="tag tag-version">v1.2+</span> |
| `create-if-not-found` | boolean    | optional  | *"If the note does not exist, create it before appending."* Defaults to `false`. <span class="tag tag-version">v1.2+</span>              |
| `ensure-newline`      | boolean    | optional  | *"Make sure the note ends with a line break."* Defaults to `false`.                                                                      |
| `silent`              | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                                                        |

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
Prepends text to a note, either to the very beginning of the note (default) or to the section below a particular headline in a note.

If the very beginning of the note is prepended, then the front matter will be honored (i.e. the new text will be added to the note body below the front matter) unless explicitly stated otherwise.

When you prepend text to a section below a heading, the headline must be entered *exactly* as it appears in the note: headline levels, capitalization, punctuation etc. For example, "## My Headline", "### My Headline", and "## my headline" are not identical.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                                                               |
| --------------------- | ---------- | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.                                            |
| `content`             | string     |           | The text to be added at the beginning of the note.                                                                                        |
| `below-headline`      | string     | optional  | Prepends text below the given headline, before the next headline or EOF, whatever comes first. <span class="tag tag-version">v1.2+</span> |
| `create-if-not-found` | boolean    | optional  | *"If the note does not exist, create it before prepending."* Defaults to `false`. <span class="tag tag-version">v1.2+</span>              |
| `ensure-newline`      | boolean    | optional  | *"Make sure the note ends with a line break."* Defaults to `false`.                                                                       |
| `ignore-front-matter` | boolean    | optional  | *"Put the text at the very beginning of the note file, even if there is front matter."*  Defaults to `false`.                             |
| `silent`              | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                                                         |


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


## `/note/touch`
<span class="tag tag-version">v1.5+</span>

Sets the modification time of the note to now.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                                                               |
| --------------------- | ---------- | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.                                            |
| `silent`              | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                                                         |
| `x-success` | string     | optional  | base URL for on-success callbacks |
| `x-error`   | string     | optional  | base URL for on-error callbacks   |


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


## `/note/rename`
<span class="tag tag-version">v0.16+</span>
Renames or moves a note. If the new file path already exists, an error will be returned. If the new file path is the same as the original one, nothing will happen. You can move a note to a different folder by specifying the new file path with a different folder name. For example, this will move the file "my-note.md" from its position at the vault root into "another-folder" while keeping the file name:

- `file`: "my-note"
- `new-filename`: "another-folder/my-note"

Any folder structure in `new-filename` will **not** be created automatically. If a folder is specified that does not exist, an error will be returned.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter      | Value type | Optional? | Description                                                                                        |
| -------------- | ---------- | :-------: | -------------------------------------------------------------------------------------------------- |
| `file`         | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted.     |
| `new-filename` | string     |           | The new file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `silent`       | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                  |

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


## `/note/search-string-and-replace`
Does text replacement in a note.  The search term is used as-is, i.e. it's a string search.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `search`  | string     |           | Text string that should be replaced.                                                           |
| `replace` | string     |           | Replacement text.                                                                              |
| `silent`  | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

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
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `search`  | string     |           | Text pattern that should be replaced.                                                          |
| `replace` | string     |           | Replacement text.                                                                              |
| `silent`  | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.              |

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


## `/note/delete`
<span class="tag tag-version">v0.16+</span>
Immediately deletes a specific note.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |

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


## `/note/trash`
<span class="tag tag-version">v0.16+</span>
Moves a specific note to the trash (either vault-local trash or system trash, depending on the configuration made in _Settings_ → _Files & Links_ → _Deleted Files_).

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |

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
