---
parent: New Routes
---

# `/open`

These routes deal with opening notes and searches in Obsidian.  Their URLs start with `obsidian://actions-uri/open/…`.


&nbsp;


## Root, i.e. `/open`

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


## `/open/daily-note`
Opens today's daily note in Obsidian.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| `error`   | A short summary of what went wrong. Example: today's note couldn't be found. |


&nbsp;


## `/open/note`
Opens a particular note in Obsidian.

| Parameter | Value  | Optional? | Description                                                                                    |
| --------- | ------ |:---------:| ---------------------------------------------------------------------------------------------- |
| `file`    | string |           | The file path of the note, relative from the vault's root. The extension `.md` can be omitted. |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |

On failure:

| Parameter | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `error`   | A short summary of what went wrong. Example: requested note doesn't exist. |


&nbsp;


## `/open/search`
Opens the search for a given query in Obsidian.

| Parameter | Value  | Optional? | Description                   |
| --------- | ------ |:---------:| ----------------------------- |
| `query`   | string |           | A valid Obsidian search query |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |
