---
parent: New Routes
---

# `/file`
<span class="tag tag-version">v1.5+</span>

These routes deal with reading, writing and updating files (i.e., any file, not just notes).  Their URLs start with `obsidian://actions-uri/file/…`.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/file`
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


## `/file/list`
Returns a list of all files (i.e. everything, not just notes) in the vault.

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


## `/file/get-active`
Returns the currently active/focussed file. If there is no open file, an error 404 is returned.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter          | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `result-filepath`  | The path to the file relative from the vault's root folder. |


On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/file/open`
Opens a specific file in Obsidian.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The path of the file, relative from the vault's root. |

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


## `/file/rename`
Renames or moves a file. If the new file path already exists, an error will be returned. If the new file path is the same as the original one, nothing will happen. You can move a file to a different folder by specifying the new file path with a different folder name. For example, this will move the file "image.jpg" from its position at the vault root into "another-folder" while keeping the file name:

- `file`: "image.jpg"
- `new-filename`: "another-folder/image.jpg"

Any folder structure in `new-filename` will **not** be created automatically. If a folder is specified that does not exist, an error will be returned.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter      | Value type | Optional? | Description                                                                                        |
| -------------- | ---------- | :-------: | -------------------------------------------------------------------------------------------------- |
| `file`         | string     |           | The path of the file, relative from the vault's root.     |
| `new-filename` | string     |           | The new path of the file, relative from the vault's root. |
| `silent`       | boolean    | optional  | *"After updating the file, do **not** open it in Obsidian."* Defaults to `false`.                  |

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


## `/file/delete`
Immediately deletes a specific file.

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The path of the file, relative from the vault's root. |

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


## `/file/trash`
Moves a specific file to the trash (either vault-local trash or system trash, depending on the configuration made in _Settings_ → _Files & Links_ → _Deleted Files_).

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description                                                                                    |
| --------- | ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `file`    | string     |           | The path of the file, relative from the vault's root. |

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
