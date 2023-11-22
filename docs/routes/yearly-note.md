---
parent: New Routes
---

# `/yearly-note`
<span class="tag tag-version">v1.3+</span>

These routes deal with reading, writing and updating yearly notes. Their URLs start with `obsidian://actions-uri/yearly-note/…`.

All routes listed here will test whether Yearly Note functionality is enabled in Obsidian and if not, will return an `x-error` callback.  (Yearly Notes are a feature of [@liamcain](https://github.com/liamcain)'s community plugin [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes).)  The settings made in the plugin's UI are honored, i.e. date format, the set folder for yearly notes etc. are taken into account when fetching, creating and updating notes.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/yearly-note`
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


## `/yearly-note/list`
Returns a list of all yearly notes.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                       |
| ----------- | ---------- | :-------: | --------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks |
| `x-error`   | string     |           | base URL for on-error callbacks   |

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


## `/yearly-note/get-current`
Returns today's yearly note.

<span class="tag tag-version">v1.4+</span> **Please note:** `result-properties` might be empty if Obsidian can't process the note's front matter. This can happen if the front matter is malformed or if the note contains a YAML block that is not front matter.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                    |
| ----------- | ---------- | :-------: | -------------------------------------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                |
| `silent`    | boolean    | optional  | *"Do **not** open the note in Obsidian."* Defaults to `false`. |

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


## `/yearly-note/get-most-recent`
Returns the most recent yearly note.  If there is a current yearly note (i.e. one for today), that's considered the most recent one, otherwise the most recent *past* yearly note is returned.

<span class="tag tag-version">v1.4+</span> **Please note:** `result-properties` might be empty if Obsidian can't process the note's front matter. This can happen if the front matter is malformed or if the note contains a YAML block that is not front matter.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter   | Value type | Optional? | Description                                                    |
| ----------- | ---------- | :-------: | -------------------------------------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks                              |
| `x-error`   | string     |           | base URL for on-error callbacks                                |
| `silent`    | boolean    | optional  | *"Do **not** open the note in Obsidian."* Defaults to `false`. |

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


## `/yearly-note/open-current`
Opens the current yearly note in Obsidian.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

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


## `/yearly-note/open-most-recent`
Opens the most recent yearly note in Obsidian.  If there is a current yearly note (i.e. one for today), that's considered the most recent one, otherwise the most recent *past* yearly note is returned.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

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


## `/yearly-note/create`
Creates a new yearly note. If a current yearly note is already present, an error will be returned.

If you want to skip the error response in favor of getting the current note as-is, pass in `if-exists=skip`. If you want to overwrite an existing note, pass in `if-exists=overwrite`.

The `apply` parameter allows you to specify what to add to the note after creation. Available options are `content` (implied default) for adding a string, `templates` (for using the Template core plugin), `templater` (for using the Templater community plugin). Depending on the `apply` parameter's value, the following additional parameters are allowed:

- `apply=content` or no `apply` parameter: `content` parameter, the initial body of the note
- `apply=templater`: `template-file` parameter, path of the template file to apply
- `apply=templates`: `template-file` parameter, path of the template file to apply

Examples:

- `apply=content&content=Hello%20world!` or `content=Hello%20world!` (as `apply=content` is the default)
- `apply=content&content=` or `content=` creates an empty note
- `apply=templater&template-file=Templates/Meeting%20notes.md`
- `apply=templates&template-file=Templates/Meeting%20notes.md`

<span class="tag tag-version">v1.4+</span> **Please note:** `result-properties` might be empty if Obsidian can't process the note's front matter. This can happen if the front matter is malformed or if the note contains a YAML block that is not front matter.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter          | Value type | Optional? | Description                                                                                                                     |
| ------------------ | ---------- | :-------: | ------------------------------------------------------------------------------------------------------------------------------- |
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


## `/yearly-note/append`
Appends text to today's yearly note, either to the very end of the note (default) or to the section below a particular headline.

When you append text to a section below a heading, the headline must be entered *exactly* as it appears in the note: headline levels, capitalization, punctuation etc. For example, "## My Headline", "### My Headline", and "## my headline" are not identical.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                   |
| --------------------- | ---------- | :-------: | --------------------------------------------------------------------------------------------- |
| `content`             | string     |           | The text to be added at the end of today's yearly note.                                       |
| `below-headline`      | string     | optional  | Appends text below the given headline, before the next headline or EOF, whatever comes first. |
| `create-if-not-found` | boolean    | optional  | *"If the note does not exist, create it before appending."* Defaults to `false`.              |
| `ensure-newline`      | boolean    | optional  | *"Make sure the note ends with a line break."* Defaults to `false`.                           |
| `silent`              | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.             |

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


## `/yearly-note/prepend`
Prepends text to today's note, either to the very beginning of the note (default) or to the section below a particular headline in a note.

If the very beginning of the note is prepended, then the front matter will be honored (i.e. the new text will be added to the note body below the front matter) unless explicitly stated otherwise.

When you prepend text to a section below a heading, the headline must be entered *exactly* as it appears in the note: headline levels, capitalization, punctuation etc. For example, "## My Headline", "### My Headline", and "## my headline" are not identical.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter             | Value type | Optional? | Description                                                                                                   |
| --------------------- | ---------- | :-------: | ------------------------------------------------------------------------------------------------------------- |
| `content`             | string     |           | The text to be added at the beginning of today's yearly note.                                                 |
| `below-headline`      | string     | optional  | Prepends text below the given headline, before the next headline or EOF, whatever comes first.                |
| `create-if-not-found` | boolean    | optional  | *"If the note does not exist, create it before prepending."* Defaults to `false`.                             |
| `ensure-newline`      | boolean    | optional  | *"Make sure the note ends with a line break."* Defaults to `false`.                                           |
| `ignore-front-matter` | boolean    | optional  | *"Put the text at the very beginning of the note file, even if there is front matter."*  Defaults to `false`. |
| `silent`              | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`.                             |

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


## `/yearly-note/search-string-and-replace`
Does text replacement in today's yearly note.  The search term is used as-is, i.e. it's a string search.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                       |
| --------- | ---------- | :-------: | --------------------------------------------------------------------------------- |
| `search`  | string     |           | Text string that should be replaced.                                              |
| `replace` | string     |           | Replacement text.                                                                 |
| `silent`  | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`. |

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


## `/yearly-note/search-regex-and-replace`
Does text replacement in today's yearly note.  The search term is used as a pattern, i.e. it's a regular expression search.

Capturing is supported. Example: the note contains the text *"and it was good"*, the `search` value is `/(it) (was)/` and the `replace` value is `$2 $1` — after the replacement the note would be changed to *"and was it good"*.

Modifiers for case-insensitive and global search (`/…/i`, `/…/g`, `/…/gi`) are supported as well. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#using_the_global_and_ignorecase_flags_with_replace) for examples.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                       |
| --------- | ---------- | :-------: | --------------------------------------------------------------------------------- |
| `search`  | string     |           | Text pattern that should be replaced.                                             |
| `replace` | string     |           | Replacement text.                                                                 |
| `silent`  | boolean    | optional  | *"After updating the note, do **not** open it in Obsidian."* Defaults to `false`. |

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
