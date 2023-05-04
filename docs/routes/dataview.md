---
parent: New Routes
---

# `/dataview`
<span class="tag tag-version">v0.14+</span>

These routes allow for running [Dataview DQL queries](https://blacksmithgu.github.io/obsidian-dataview/queries/structure/).  Their URLs start with `obsidian://actions-uri/dataview`.

Currently, only [`LIST`](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#list-queries) and [`TABLE`](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types/#table-queries) DQL queries are supported.

<div id="toc"></div>


&nbsp;


## Root, i.e. `/dataview`
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


## `/dataview/list-query`

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description         |
| --------- | ---------- |:---------:| ------------------- |
| `dql`     | string     |           | A DQL `LIST` query. |


### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter     | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `result-data` | An array containing strings (the list results), encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |


&nbsp;


## `/dataview/table-query`

### Parameters
In addition to the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)):

| Parameter | Value type | Optional? | Description          |
| --------- | ---------- |:---------:| -------------------- |
| `dql`     | string     |           | A DQL `TABLE` query. |


### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter     | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `result-data` | An array containing arrays of strings (the result table), encoded as JSON string. |

On failure:

| Parameter      | Description                         |
| -------------- | ----------------------------------- |
| `errorCode`    | A HTTP status code.                 |
| `errorMessage` | A short summary of what went wrong. |
