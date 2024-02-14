---
parent: New Routes
---

# `/vault`
<span class="tag tag-version">v0.12+</span>

These routes deal with handling an Obsidian vault.  Their URLs start with `obsidian://actions-uri/vault`.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/vault`
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


## `/vault/open`
Opens a specific vault.  For this to work, the vault must be in the list of vaults that Obsidian knows about and Actions URI needs to be active in that vault.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| --------- | ----------- |
| /         |             |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/vault/close`
<span class="tag tag-platform">Desktop only</span>
Closes a specific vault.  For this to work, the vault must be in the list of vaults that Obsidian knows about and Actions URI needs to be active in that vault.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter | Description |
| --------- | ----------- |
| /         |             |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/vault/info`
<span class="tag tag-version">v0.13+</span>
Returns the full filesystem paths for the vault, its media folder and the "new note" folder.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter                       | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `result-base-path`              | The full filesystem path to the vault.                     |
| `result-attachment-folder-path` | The full filesystem path to the vault's media folder.      |
| `result-new-file-folder-path`   | The full filesystem path to the vault's "new note" folder. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/vault/list-all-files`
<span class="tag tag-version">v0.14+</span>
Returns a list of all files in the vault.

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


## `/vault/list-non-notes-files`
<span class="tag tag-version">v0.14+</span>
Returns a list of all non Markdown files in the vault.

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
