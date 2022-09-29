## `/daily-note`

Does nothing but say hello.
## `/daily-note/get-current`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `action` | string |  |
| `vault` | string |  |
| `x-error` | string |  |
| `x-success` | string |  |

=> HandlerFileSuccess | HandlerFailure
## `/daily-note/get-current`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string |  |
| `x-success` | string |  |
| `action` | string |  |
| `vault` | string |  |

=> HandlerFileSuccess | HandlerFailure
## `/daily-note/create`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `content` | string | yes |
| `overwrite` | boolean | yes |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerFileSuccess | HandlerFailure
## `/daily-note/append`

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
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/daily-note/prepend`

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
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/daily-note/search-string-and-replace`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `replace` | string |  |
| `search` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
## `/daily-note/search-regex-and-replace`

TODO
| Parameter | Value | optional | |
| --- | --- | --- | --- |
| `call-id` | string | yes |
| `debug-mode` | boolean | yes |
| `x-error` | string | yes |
| `x-success` | string | yes |
| `action` | string |  |
| `replace` | string |  |
| `search` | string |  |
| `silent` | boolean | yes |
| `vault` | string |  |

=> HandlerTextSuccess | HandlerFailure
