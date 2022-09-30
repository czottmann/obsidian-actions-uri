# [Actions URI](README.md) ≫ Route `/open`
Calls going to `obsidian://actions-uri/open/…`


## Root, i.e. `/open`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
=> HandlerTextSuccess

### Example
TODO

---

## `/open/daily-note`
Opens today's daily note in Obsidian.

| Parameter | Value | optional | |
| --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure


## `/open/note`
Opens a particular note in Obsidian.

| Parameter | Value | optional | |
| --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `file` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure


## `/open/search`
Opens the search for a given query in Obsidian.

| Parameter | Value | optional | |
| --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `query` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess

