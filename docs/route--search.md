# [Actions URI](README.md) ≫ Route `/search`
Calls going to `obsidian://actions-uri/search/…`


## Root, i.e. `/search`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
=> HandlerTextSuccess

### Example
TODO

---

## `/search/all-notes`
Returns search results (file paths) for a given search query.

| Parameter    | Value   | Optional? | Description |
| ------------ | ------- |:---------:| ----------- |
| `call-id`    | string  |    ✅     |             |
| `debug-mode` | boolean |    ✅     |             | 
| `x-error`    | string  |           |             |
| `x-success`  | string  |           |             |
| `action`     | string  |           |             |
| `query`      | string  |           |             |
| `vault`      | string  |           |             |

=> HandlerSearchSuccess | HandlerFailure
