---
parent: New Routes
---

# `/`

All URLs start with `obsidian://actions-uri`.

<div id="toc"></div>


&nbsp;


## `obsidian://actions-uri`
Does nothing but say hello (display a wee Notice toast in Obsidian.)

### Parameters
Only supports the base parameters (see section ["Parameters required in/ accepted by all calls"](../parameters.md)).

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter        | Description                       |
| ---------------- | --------------------------------- |
| `result-message` | A short summary of what was done. |
