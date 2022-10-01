---
nav_order: 3
---

# Parameters required in/ accepted by all calls

| Parameter    | Value type | Optional? | Description                                                                                                                                                                |
| ------------ | ---------- |:---------:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vault`      | string     |           | The name of the target vault.                                                                                                                                              |
| `x-success`  | string     |  mostly   | Base URL for on-success callbacks, see [Getting data back from Actions URI](callbacks.md).                                                                                 |
| `x-error`    | string     |  mostly   | Base URL for on-error callbacks, see [Getting data back from Actions URI](callbacks.md).                                                                                   |
| `call-id`    | string     |    ✅     | Unique ID for pairing request & callback, see [Getting data back from Actions URI](callbacks.md).                                                                          |
| `debug-mode` | boolean    |    ✅     | When enabled, Actions URI will include not just the `call-id` in the return calls but all parameters of the original request, prefixed with `input-`. Defaults to `false`. |

## Notes about parameters

<dl>
  <dt>"mostly"</dt>
  <dd>optional unless specified otherwise in the detailed route description</dd>
  <dt>"boolean"</dt>
  <dd>Actions URI uses what I call "benevolent booleans": the absence of the parameter, an empty string or the string "false" are considered <code>false</code>, everything else is <code>true</code></dd>
</dl>
