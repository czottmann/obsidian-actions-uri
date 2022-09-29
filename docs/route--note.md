## `/note`

Does nothing but say hello.
## `/note/get`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string |  |
| `x-success` | string |  |
| `action` | string |  |
| `file` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerFileSuccess | HandlerFailure
## `/note/create`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `content` | string | yes |
| `file` | string |  |
| `overwrite` | boolean | yes |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/note/append`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `ensure-newline` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `content` | string |  |
| `file` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/note/prepend`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `ensure-newline` | boolean | yes |
| `ignore-front-matter` | boolean |  |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `content` | string |  |
| `file` | string |  |
| `silent` | boolean | yes |

=> HandlerTextSuccess | HandlerFailure
## `/note/search-and-replace`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `file` | string |  |
| `replace` | string |  |
| `search` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/note/search-and-replace-regex`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `file` | string |  |
| `replace` | string |  |
| `search` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
