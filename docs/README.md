# Actions URI
Obsidian natively supports a custom URI protocol `obsidian://` which can be used to trigger various actions within the app.  This is commonly used on macOS and mobile apps for automation and cross-app workflows.

**This plugin adds new `x-callback-url` endpoints** to Obsidian so that external sources can better interact with an Obsidian instance by making `GET` requests to a `obsidian://actions-uri/*` URL.  All new routes support `x-success` and `x-error` parameters as a way of communicating back to the sender.  See below for detailed documentation.

It is a clean, somewhat super-charged addition to Obsidian's [own URI scheme](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Using+Obsidian+URIs).


## Routes added by Actions URI
- [`/daily-note`](route--daily-note.md): Reading, writing, updating daily notes.
- [`/info`](route--info.md): Plugin & Obsidian environment info.
- [`/note`](route--note.md): Reading, writing, updating any notes.
- [`/open`](route--open.md): Opening notes, daily notes and searches in Obsidian.
- [`/search`](route--search.md): Running searches in Obsidian.
- [`/`](route--root.md): The root note. Not much is happening here.


## Anatomy of an Actions URI… URL
An Action URI-provided URL doesn't look much different from a standard Obsidian URI.  It adds a new namespace that tells Obsidian which plugin is taking care of the incoming call:

> obsidian://`actions-uri`/daily-note/get-current?parameter=value

… and specifies routes in that namespace:

> obsidian://actions-uri/`daily-note/get-current`?parameter=value

Both data and configuration is passed as URL search parameters:

> obsidian://actions-uri/daily-note/get-current?`parameter=value`

**Please note:** all parameter data must be properly encoded (see [Wikipedia](https://en.wikipedia.org/wiki/Percent-encoding) for a short intro), as Actions URI will make no attempts to correct malformed input.


## Parameters required in/ accepted by all calls
| Parameter    | Value type | Optional? | Description                                                                                                                                                                |
| ------------ | ---------- |:---------:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vault`      | string     |           | The name of the target vault.                                                                                                                                              |
| `x-success`  | string     |  mostly   | Base URL for on-success callbacks, see [Getting data back from Actions URI](callbacks.md).                                                                                 |
| `x-error`    | string     |  mostly   | Base URL for on-error callbacks, see [Getting data back from Actions URI](callbacks.md).                                                                                   |
| `call-id`    | string     |    ✅     | Unique ID for pairing request & callback, see [Getting data back from Actions URI](callbacks.md).                                                                          |
| `debug-mode` | boolean    |    ✅     | When enabled, Actions URI will include not just the `call-id` in the return calls but all parameters of the original request, prefixed with `input-`. Defaults to `false`. |

### Notes about parameters

<dl>
  <dt>"mostly"</dt>
  <dd>optional unless specified otherwise in the detailed route description</dd>
  <dt>"boolean"</dt>
  <dd>Actions URI uses what I call "benevolent booleans": the absence of the parameter, an empty string or the string "false" are considered <code>false</code>, everything else is <code>true</code></dd>
</dl>


## Getting data back from Actions URI
See [Getting data back from Actions URI](callbacks.md).


## FAQs

### Why does this exist?
One major reason is an upcoming project of mine, for which I need a way to access my vault data from "the outside".  The existing options either didn't fully cut it — like [Obsidian URI](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI) — or we're pretty full of features but left me wanting anyways, like [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) which does *a lot* but in a way and format that didn't quite gel with me. (Additionally, its author doesn't use actually it anymore[^1] which in my eyes makes it a gamble to rely on it for a new project.)

[^1]: Source: https://vinzent03.github.io/obsidian-advanced-uri/

So, here we are! 😀 


### *"I have an idea for this!"*
Cool!  If you want to discuss it, either [post it to the Ideas discussion board](https://github.com/czottmann/obsidian-actions-uri/discussions/categories/ideas) or [hit me up on Twitter](https://twitter.com/municode).  I'm all ears! 👂🏼


### *"There's a bug!"*, *"There's something wrong"* etc.
Oh no!  Please [file a bug report](https://github.com/czottmann/obsidian-actions-uri/issues) here or (if you're unsure about it) [ping me on Twitter](https://twitter.com/municode).


