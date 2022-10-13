---
nav_order: 5
---

# Anatomy of an Actions URI… URL

An Action URI-provided URL doesn't look much different from a standard Obsidian URI.  Its host "actions-uri" tells Obsidian which plugin is taking care of the incoming call:

> obsidian://`actions-uri`/daily-note/get-current?parameter=value

… and the path (a.k.a. a route) specifies what to do:

> obsidian://actions-uri/`daily-note/get-current`?parameter=value

Both data and configuration are passed as URL search parameters:

> obsidian://actions-uri/daily-note/get-current?`parameter=value`

**Please note:** all parameter data must be properly encoded (see [Wikipedia](https://en.wikipedia.org/wiki/Percent-encoding) for a short intro), as Actions URI will make no attempts to correct malformed input.
