---
parent: New Routes
---

# `/vault`
<span class="tag-version">v0.12+</span>

These routes deal with handling an Obsidian vault.  Their URLs start with `obsidian://actions-uri/vault`.


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
