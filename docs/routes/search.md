---
parent: New Routes
---

# `/search`

These routes deal with running searches in Obsidian.  Their URLs start with `obsidian://actions-uri/search/…`.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/search`

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


## `/search/all-notes`
<span class="tag tag-platform">Desktop only</span>
Returns search results (file paths) for a given search query.

| Parameter   | Value  | Optional? | Description                       |
| ----------- | ------ | :-------: | --------------------------------- |
| `query`     | string |           |                                   |
| `x-success` | string |           | base URL for on-success callbacks |
| `x-error`   | string |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter     | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `result-hits` | Array with found file paths encoded as JSON string. (The max number of results varies, in my tests it was 36.) |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/search/open`
Opens the search for a given query in Obsidian.

| Parameter | Value  | Optional? | Description                   |
| --------- | ------ | :-------: | ----------------------------- |
| `query`   | string |           | A valid Obsidian search query |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |
