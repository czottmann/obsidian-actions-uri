# [Actions URI](index.md) ≫ Getting data back from Actions URI

All routes support return calls back to the sender. This is done by passing callback URLs as parameters, e.g.:

```
obsidian://actions-uri/note/get?vault=My%20Vault&file=My%20super%20note&x-success=my-app://success&x-error=my-app://error&call-id=9c2d1bff
```

This example call contains five parameters: `vault`, `file`, `x-success`, `x-error` and `call-id`.  The latter three are needed to provide a callback to the sender.

- `x-success` contains a base URL for returning success information
- `x-error` contains a base URL for returning failure information
- `call-id` contains a unique ID specified by the sender (optional).

When Actions URI has completed a requested action, it'll build a callback URL from the value of either `x-success` or `x-error`. The base URL will be enhanced with search parameters containing both the requested data (prefixed with `result-`) and the `call-id` (prefixed with `input-`), then the call is made.  The receiver can then use that `input-call-id` parameter to pair the incoming result with the original request.  (The value of the parameter is arbitrary, it will be returned as-is.)

Let's take the above example.  Assuming the file `My super note.md` in vault `My Vault` exists and contains some front matter and the note body *"Actions URI is ready for action!"*, Actions URI would make a callback to the following URL (formatted for better readability):

```
my-app://success
  ?result-body=%0AActions+URI+is+ready+for+action%21
  &result-content=---%0Atags%3A+test%0A---%0A%0AActions+URI+is+ready+for+action%21
  &result-filepath=My+super+note.md
  &result-front-matter=tags%3A+test%0A
  &input-call-id=9c2d1bff
```

Assuming the note does not exist, the resulting call would be:

```
my-app://error
  ?error=Note+couldn%27t+be+found
  &input-call-id=9c2d1bff
```
