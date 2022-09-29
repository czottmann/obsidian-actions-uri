## `/search`

Does nothing but say hello.
## `/search/all-notes`

Returns search results (file paths) for a given search query.
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string |  |
| `x-success` | string |  |
| `action` | string |  |
| `query` | string |  |
| `vault` | string |  |

=> HandlerSearchSuccess | HandlerFailure
