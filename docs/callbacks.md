---
nav_order: 4
---

# Getting data back from Actions URI

All routes support return calls back to the sender. This is done by passing callback URLs as parameters, e.g.:

```
obsidian://actions-uri/note/get
  ?vault=My%20Vault
  &file=My%20super%20note
  &x-success=my-app%3A%2F%2Fsuccess%3Frequest-id%3D123456789
  &x-error=my-app%3A%2F%2Ferror
```

This example call, formatted for better readability, contains four parameters: `vault`, `file`, `x-success` and `x-error`.  The latter two are used to provide callbacks to the sender.

- `x-success` contains a base URL for returning success information — in the above example, that's `my-app://success?request-id=123456789`
- `x-error` contains a base URL for returning failure information — in the above example, that's `my-app://error`

When Actions URI has completed the work requested by the incoming call, it'll build a callback URL from the value of either `x-success` or `x-error`. The search parameters containing the requested data (prefixed with `result-`) will be added to the URL, then the outgoing call is made.  The `x-success`/`x-error` URL may contain a path and/or parameters, those will be used as-is.

Let's continue with the above example. Assuming the file `My super note.md` exists in vault `My Vault` and contains both front matter and the note body *"Actions URI is ready for action!"*, Actions URI would make a callback to the following URL, formatted for better readability:

```
my-app://success
  ?request-id=123456789
  &result-body=%0AActions+URI+is+ready+for+action%21
  &result-content=---%0Atags%3A+test%0A---%0A%0AActions+URI+is+ready+for+action%21
  &result-filepath=My+super+note.md
  &result-front-matter=tags%3A+test%0A
```

The successful callback contains the full note content (`result-content`), the note body (`result-body`), the note's path (`result-filepath`) and its front matter (`result-front-matter`).

Assuming the note does **not** exist, the resulting call would be:

```
my-app://error
  ?errorCode=404
  &errorMessage=Note+couldn%27t+be+found
```

`errorCode` contains a HTTP status, `errorMessage` contains a simple explanation.


## Important note on callback parameters
**The on-success callback parameter structure varies depending on the endpoints.** See the relevant [routes descriptions](routes.md) for details.

On-error callbacks always have the same parameter structure.


## Debug mode
With `debug-mode` enabled in the incoming request (see ["Parameters required in/ accepted by all calls"](parameters.md)), the on-success callback of the above example would look like this:

```
my-app://success
  ?request-id=123456789
  &result-body=%0AActions+URI+is+ready+for+action%21
  &result-content=---%0Atags%3A+test%0A---%0A%0AActions+URI+is+ready+for+action%21
  &result-filepath=My+super+note.md
  &result-front-matter=tags%3A+test%0A
  &input-action=actions-uri%2Fnote%2Fget
  &input-file=My+super+note.md
  &input-silent=false
  &input-vault=Testbed
```

It's called "debug mode" because it's helpful when developing an external *whatever* communicating with Obsidian via Actions URI.  In production you'll probably want to pair the callbacks to your original requests, that's where the `request-id` parameter (or something similar) in the `x-success` URL comes into play.  I'm not aware of any drawbacks keeping debug mode on in live code, however.  You do you! 🖖🏼
