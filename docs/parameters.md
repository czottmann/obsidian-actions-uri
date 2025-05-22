---
nav_order: 3
---

# Parameters required & accepted by all endpoints

| Parameter                 | Value type | Optional? | Description                                                                                                                                    
| ------------------------- | ---------- | :-------: | -----------------------------------------------------------------------------------------------------------------------------------------------
| `vault`                   | string     |           | The name of the target vault.                                                                                                                  
| `x-success`               | string     |  mostly   | Base URL for on-success callbacks, see [Getting data back from Actions URI](callbacks.md).                                                     
| `x-error`                 | string     |  mostly   | Base URL for on-error callbacks, see [Getting data back from Actions URI](callbacks.md).                                                       
| `debug-mode`              | boolean    |    yes    | When enabled, Actions URI will include all parameters of the original request in the return calls, prefixed with `input-`. Defaults to `false`.
| `hide-ui-notice-on-error` | boolean    |    yes    | <span class="tag tag-version">v1.8+</span> When enabled, the UI notice will not be shown on "note not found" errors etc. Defaults to `false`.  

## Notes about parameters

<dl>
  <dt>"mostly"</dt>
  <dd>optional unless specified otherwise in the detailed route description</dd>
  <dt>"boolean"</dt>
  <dd>Actions URI uses what I call "benevolent booleans": the absence of the parameter, an empty string or the string "false" are considered <code>false</code>, everything else is <code>true</code></dd>
</dl>
