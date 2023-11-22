---
parent: New Routes
---

# `/folder`
<span class="tag tag-version">v0.16+</span>

These routes deal with folders.  Their URLs start with `obsidian://actions-uri/folder/…`.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/folder`

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


## `/folder/list`
Returns a list of folder paths.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

| Parameter   | Value type | Optional? | Description                       |
| ----------- | ---------- | :-------: | --------------------------------- |
| `x-success` | string     |           | base URL for on-success callbacks |
| `x-error`   | string     |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter      | Description                                               |
| -------------- | --------------------------------------------------------- |
| `result-paths` | Array containing all folder paths encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/folder/create`
Creates a new folder or folder structure. In case the folder already exists, nothing will happen.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                      |
| --------- | ---------- | :-------: | ------------------------------------------------ |
| `folder`  | string     |           | The folder path, relative from the vault's root. |

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


## `/folder/rename`
Renames or moves a folder. If the new folder path already exists, an error will be returned. If the new folder path is the same as the original one, nothing will happen. Any folder structure in `new-foldername` will **not** be created automatically. If a folder is specified that does not exist, an error will be returned.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter        | Value type | Optional? | Description                                          |
| ---------------- | ---------- | :-------: | ---------------------------------------------------- |
| `folder`         | string     |           | The folder path, relative from the vault's root.     |
| `new-foldername` | string     |           | The new folder path, relative from the vault's root. |

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


## `/folder/delete`
Immediately deletes a folder and all its contents.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                      |
| --------- | ---------- | :-------: | ------------------------------------------------ |
| `folder`  | string     |           | The folder path, relative from the vault's root. |

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


## `/folder/trash`
Moves a folder to the trash (either vault-local trash or system trash, depending on the configuration made in _Settings_ → _Files & Links_ → _Deleted Files_).

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                      |
| --------- | ---------- | :-------: | ------------------------------------------------ |
| `folder`  | string     |           | The folder path, relative from the vault's root. |

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
