---
parent: New Routes
---

# `/info`

These routes deal with plugin & Obsidian environment info.  Their URLs start with `obsidian://actions-uri/info`.

<div id="toc"></div>


&nbsp;


## `/info`
Returns information about the plugin and the current Obsidian instance.

| Parameter   | Value  | Optional? | Description                       |
| ----------- | ------ | :-------: | --------------------------------- |
| `x-success` | string |           | base URL for on-success callbacks |
| `x-error`   | string |           | base URL for on-error callbacks   |

### Return values
These parameters will be added to the callbacks used for [getting data back from Actions URI](../callbacks.md).

On success:

| Parameter                   | Description                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `result-plugin-version`     | The version of the responding Action URI plugin                                                     |
| `result-plugin-released-at` | The release timestamp of the responding Action URI plugin (ISO 8601)                                |
| `result-api-version`        | The API version of the app, which follows the release cycle of the desktop app                      |
| `result-node-version`       | The version of Node running the plugin, e.g. "16.13.2"                                              |
| `result-os`                 | OS information gathered from Obsidian's user agent string, e.g. "Macintosh; Intel Mac OS X 10_15_7" |
| `result-platform`           | Returns "macOS", "Windows/Linux" "iOS" or "Android"                                                 |
