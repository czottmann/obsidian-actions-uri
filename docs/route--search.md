# [Actions URI](README.md) ≫ Route `/search`
Calls going to `obsidian://actions-uri/search/…`


## Root, i.e. `/search`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
=> HandlerTextSuccess

### Example
TODO

---

## `/search/all-notes`
Returns search results (file paths) for a given search query.

| Parameter | Value | optional | |
| --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string |  |
| `x-success` | string |  |
| `action` | string |  |
| `query` | string |  |
| `vault` | string |  |

=> HandlerSearchSuccess | HandlerFailure
