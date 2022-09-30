# [Actions URI](README.md) ≫ Route `/open`
Calls going to `obsidian://actions-uri/open/…`


## Root, i.e. `/open`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
=> HandlerTextSuccess

### Example
TODO

---

## `/open/daily-note`
Opens today's daily note in Obsidian.

| Parameter    | Value   | Optional? | Description | 
| ------------ | ------- |:---------:| ----------- |
| `call-id`    | string  |    ✅     |             |
| `debug-mode` | boolean |    ✅     |             |
| `x-error`    | string  |    ✅     |             |
| `x-success`  | string  |    ✅     |             |
| `action`     | string  |           |             |
| `silent`     | boolean |    ✅     |             |
| `vault`      | string  |           |             |

=> HandlerTextSuccess | HandlerFailure


## `/open/note`
Opens a particular note in Obsidian.

| Parameter    | Value   | Optional? | Description |
| ------------ | ------- |:---------:| ----------- |
| `call-id`    | string  |    ✅     |             |
| `debug-mode` | boolean |    ✅     |             |
| `x-error`    | string  |    ✅     |             |
| `x-success`  | string  |    ✅     |             |
| `action`     | string  |           |             |
| `file`       | string  |           |             |
| `silent`     | boolean |    ✅     |             |
| `vault`      | string  |           |             |

=> HandlerTextSuccess | HandlerFailure


## `/open/search`
Opens the search for a given query in Obsidian.

| Parameter    | Value   | Optional? | Description |
| ------------ | ------- |:---------:| ----------- |
| `call-id`    | string  |    ✅     |             |
| `debug-mode` | boolean |    ✅     |             |
| `x-error`    | string  |    ✅     |             |
| `x-success`  | string  |    ✅     |             |
| `action`     | string  |           |             |
| `query`      | string  |           |             |
| `silent`     | boolean |    ✅     |             |
| `vault`      | string  |           |             |

=> HandlerTextSuccess

