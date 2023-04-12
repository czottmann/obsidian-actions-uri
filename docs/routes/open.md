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


## `/open/search` <span class="tag tag-deprecated">Deprecated since v0.17</span>
Opens the search for a given query in Obsidian.

DEPRECATED: Use [`/search/open`](./search.md) instead.

| Parameter | Value  | Optional? | Description                   |
| --------- | ------ |:---------:| ----------------------------- |
| `query`   | string |           | A valid Obsidian search query |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |
