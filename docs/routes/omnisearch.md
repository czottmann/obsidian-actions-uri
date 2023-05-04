---
parent: New Routes
---

# `/omnisearch`
<span class="tag tag-version">v1.1+</span>

These routes deal with running searches through the
[Omnisearch plugin](https://publish.obsidian.md/omnisearch/Index) in Obsidian.
Their URLs start with `obsidian://actions-uri/omnisearch/…`.

(Omnisearch isn't installed by default, but it is a superior choice for
searching through your vault.)

<div id="toc" />


&nbsp;


## Root, i.e. `/omnisearch`

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


## `/omnisearch/all-notes`
Returns Omnisearch results (file paths) for a given search query.

| Parameter   | Value  | Optional? | Description                       |
| ----------- | ------ |:---------:| --------------------------------- |
| `query`     | string |           | A valid Omnisearch query          |
| `x-success` | string |           | base URL for on-success callbacks |
| `x-error`   | string |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter     | Description                                         |
| ------------- | --------------------------------------------------- |
| `result-hits` | Array with found file paths encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/omnisearch/open`
Opens Omnisearch for a given query in Obsidian.

| Parameter | Value  | Optional? | Description              |
| --------- | ------ |:---------:| ------------------------ |
| `query`   | string |           | A valid Omnisearch query |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |
