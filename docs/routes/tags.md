---
parent: New Routes
---

# `/tags`
<span class="tag tag-version">v0.13+</span>

These routes deal with a vault's tags.  Their URLs start with `obsidian://actions-uri/tags`.


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


## `/tags/list`
Returns list of all tags used in the queried vault.

| Parameter   | Value  | Optional? | Description                       |
| ----------- | ------ |:---------:| --------------------------------- |
| `x-success` | string |           | base URL for on-success callbacks |
| `x-error`   | string |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter     | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `result-tags` | JSON-encoded string array, sorted alphabetically. The tags are returned as-is, i.e. including the leading `#`. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |
