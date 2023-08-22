---
parent: New Routes
---

# `/command`
<span class="tag tag-version">v1.3+</span>

These routes deal with getting the list of available Obsidian commands (think Command Palette) and executing them.  Their URLs start with `obsidian://actions-uri/command`.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/tags`
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


## `/command/list`
Returns list of all Obsidian Commands available in the queried vault.

| Parameter   | Value  | Optional? | Description                       |
| ----------- | ------ |:---------:| --------------------------------- |
| `x-success` | string |           | base URL for on-success callbacks |
| `x-error`   | string |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter         | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `result-commands` | JSON-encoded array of objects (`{id: string, name: string}`) |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/command/execute`
Triggers the passed-in command or commands in sequence, in the specified vault.

| Parameter       | Value  | Optional? | Description                                                      |
| --------------- | ------ |:---------:| ---------------------------------------------------------------- |
| `commands`      | string |           | Comma-separated list of command IDs.                             |
| `pause-in-secs` | number | yes       | Length of the pause in seconds between commands. Default: `0.2`. |
| `x-success`     | string |           | base URL for on-success callbacks                                |
| `x-error`       | string |           | base URL for on-error callbacks                                  |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |
