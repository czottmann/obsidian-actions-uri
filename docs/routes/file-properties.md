---
parent: New Routes
---

# `/file-properties`
<span class="tag tag-version">v1.4+</span>

These routes deal with reading, writing and updating [note properties](https://help.obsidian.md/Editing+and+formatting/Properties).  Their URLs start with `obsidian://actions-uri/file-properties/…`.

Please keep in mind that setting new properties will effectively rewrite a note's front matter.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/file-properties`

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


## `/file-properties/get`

Returns a note's properties.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description |
| - | - |:-:| - |
| `file` | string | | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `x-success` | string | | base URL for on-success callbacks |
| `x-error` | string | | base URL for on-error callbacks |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| - | - |
| `result-properties` | The file's properties encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/file-properties/set`

Overwrites or updates a note's properties.

When **overwriting**, all of the note's properties will be replaced with the new ones. When **updating**, the properties specified in the `properties` parameter will replace existing keys with the same name, leaving the rest untouched.

In absence of a dedicated Obsidian API method for writing properties (AFAICT), Actions URI will translate the `properties` parameter into front matter YAML, and then replace the old front matter. Obsidian will pick up the file change and populate the note's properties from the changed front matter. *How* Obsidian interprets those values is up to, and can only be done in Obsidian itself, please see [the official Property doc page for more details](https://help.obsidian.md/Editing+and+formatting/Properties#Property%20types).

The `properties` parameter will only accept object values with valid types (i.e., string, list of strings, number, and boolean). Date and Date & Time properties are represented as string values.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description |
| - | - |:-:| - |
| `file` | string | | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `properties` | string | | The new properties encoded as JSON string. |
| `mode` | string | ✅ | Either `overwrite` or `update`. Defaults to `overwrite`. |
| `x-success` | string | | base URL for on-success callbacks |
| `x-error` | string | | base URL for on-error callbacks |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| - | - |
| `result-body` | The note body, i.e. the note file content minus possible front matter. |
| `result-content` | The entire content of the note file. |
| `result-filepath` | The file path of the note, relative from the vault root folder. |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |
| `result-properties` | The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/file-properties/clear`

Removes the entirety of a note's properties (and therefore, its front matter).

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description |
| - | - |:-:| - |
| `file` | string | | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `properties` | string | | The new properties encoded as JSON string. |
| `mode` | string | ✅ | Either `overwrite` or `update`. Defaults to `overwrite`. |
| `x-success` | string | | base URL for on-success callbacks |
| `x-error` | string | | base URL for on-error callbacks |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| - | - |
| `result-body` | The note body, i.e. the note file content minus possible front matter. |
| `result-content` | The entire content of the note file. |
| `result-filepath` | The file path of the note, relative from the vault root folder. |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |
| `result-properties` | The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/file-properties/remove-keys`

Remove one or more keys from a note's properties (and therefore, its front matter).

The `keys` parameter is a JSON-encoded array of strings, e.g. `["createdAt", "aliases"]`, because keys in a note's properties may contain commas etc., which prevented using a simpler CSV-type parameter like "createdAt,aliases". 🤷🏻‍♂️

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description |
| - | - |:-:| - |
| `file` | string | | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |
| `keys` | string | | The list of keys to remove, as a JSON-encoded array of strings. |
| `x-success` | string | | base URL for on-success callbacks |
| `x-error` | string | | base URL for on-error callbacks |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| - | - |
| `result-body` | The note body, i.e. the note file content minus possible front matter. |
| `result-content` | The entire content of the note file. |
| `result-filepath` | The file path of the note, relative from the vault root folder. |
| `result-front-matter` | The note's front matter, i.e. the note file content minus the note body. |
| `result-properties` | The note's [properties](https://help.obsidian.md/Editing+and+formatting/Properties). |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |
