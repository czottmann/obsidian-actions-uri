# Actions URI
Obsidian natively supports a custom URI protocol `obsidian://` which can be used to trigger various actions within the app.  This is commonly used on macOS and mobile apps for automation and cross-app workflows.

**This plugin adds new `x-callback-url` endpoints** to Obsidian so that external sources can better interact with an Obsidian instance in a programmatic way by making `GET` requests to a `obsidian://actions-uri/*` URL.  All new routes support `x-success` and `x-error` parameters as a way of communicating back to the sender.  See below for detailed documentation.

It is a clean, somewhat super-charged addition to Obsidian's [own URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Using+Obsidian+URIs).


## Routes added by Actions URI
- [`/daily-note`](route--daily-note.md): Reading, writing, updating daily notes.
- [`/info`](route--info.md): Plugin & Obsidian environment info.
- [`/note`](route--note.md): Reading, writing, updating any notes.
- [`/open`](route--open.md): Opening notes, daily notes and searches in Obsidian.
- [`/search`](route--search.md): Running searches in Obsidian.
- [`/`](route--root.md): The root note. Not much is happening here.


## Anatomy of an Actions URI route
An Action URI-provided URL doesn't look much different from a standard Obsidian URI.  It adds a new namespace that tells Obsidian which plugin is taking care of the incoming call:

> obsidian://`actions-uri`/daily-note/get-current?parameter=value

… and routes in that namespace:

> obsidian://actions-uri/`daily-note/get-current`?parameter=value

(In this context, the part `daily-note/get-current` is also called an "action".)  Both data and configuration is passed as URL search parameters:

> obsidian://actions-uri/daily-note/get-current?`parameter=value`

**Please note:** all parameter data must be properly encoded (see [Wikipedia](https://en.wikipedia.org/wiki/Percent-encoding) for a short intro), as Actions URI will make no attempts to correct malformed input.


## Parameters required in/ accepted by all calls
| Parameter    | Value              | optional | Description                                                                                                                                                   |
| ------------ | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vault`      | string             |          | the name of the target vault                                                                                                                                  |
| `x-success`  | string             | mostly   | base URL for on-success callbacks, see [Getting data back from Actions URI](callbacks.md)                                                                     |
| `x-error`    | string             | mostly   | base URL for on-error callbacks, see [Getting data back from Actions URI](callbacks.md)                                                                       |
| `call-id`    | string             | yes      | unique ID for pairing request & callback, see [Getting data back from Actions URI](callbacks.md)                                                              |
| `debug-mode` | benevolent boolean | yes      | when enabled will include not just the `call-id` in the return calls but all parameters of the original request, prefixed with `input-`. Disabled by default. |

### Notes about parameters

<dl>
  <dt>"mostly"</dt>
  <dd>optional unless specified otherwise in the detailed route description</dd>
  <dt>"boolean"</dt>
  <dd>Actions URI uses what I call "benevolent booleans": the absence of the parameter, an empty string or the string "false" are considered <code>false</code>, everything else is <code>true</code></dd>
</dl>


## Getting data back from Actions URI
See [Getting data back from Actions URI](callbacks.md).

