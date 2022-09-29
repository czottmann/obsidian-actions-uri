# [Actions URI](index.md) → Route `/`
Calls going to `obsidian://actions-uri`


## `obsidian://actions-uri`
Does nothing but say hello (display a wee Notice toast in Obsidian.)

### Parameters
| Parameter   | Value  | optional | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `vault`     | string |          | Name of target vault              |
| `x-error`   | string | yes      | base URL for on-success callbacks |
| `x-success` | string | yes      | base URL for on-error callbacks   |


### Example
