# [Actions URI](README.md) ≫ Route `/daily-note`
Calls going to `obsidian://actions-uri/daily-note/…`


## Root, i.e. `/daily-note`

Does nothing but say hello.

### Parameters
Only supports the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)).

### Return values
=> HandlerTextSuccess

### Example
TODO

---

## `/daily-note/get-current`
Returns today's daily note.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter    | Value   | optional | Description                                   |
| ------------ | ------- | -------- | --------------------------------------------- |
| `silent`     | boolean | yes      |                                               |
| `x-success`  | string  |          | base URL for on-success callbacks             |
| `x-error`    | string  |          | base URL for on-error callbacks               |

### Return values
=> HandlerFileSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/get-most-recent`
Returns the most recent daily note.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter    | Value   | optional | Description                                   |
| ------------ | ------- | -------- | --------------------------------------------- |
| `silent`     | boolean | yes      |                                               |
| `x-success`  | string  |          | base URL for on-error callbacks               |
| `x-error`    | string  |          | base URL for on-error callbacks               |

### Return values
=> HandlerFileSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/create`
Creates a new daily note. In case of an already existing current daily note, it will be overwritten **only** if the related parameter is set.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter    | Value   | optional | Description                                   |
| ------------ | ------- | -------- | --------------------------------------------- |
| `content`    | string  | yes      |                                               |
| `overwrite`  | boolean | yes      |                                               |
| `silent`     | boolean | yes      |                                               |

### Return values
=> HandlerFileSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/append`
Appends today's daily note with a string.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter        | Value   | optional | Description                                   |
| ---------------- | ------- | -------- | --------------------------------------------- |
| `content`        | string  |          |                                               |
| `ensure-newline` | boolean | yes      |                                               |
| `silent`         | boolean | yes      |                                               |

### Return values
=> HandlerTextSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/prepend`
Prepends today's daily note with a string.  Front matter is honored (i.e. the new text will be added to the note body below the front matter) unless explicity stated.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter        | Value   | optional | Description                                   |
| ---------------- | ------- | -------- | --------------------------------------------- |
| `content`        | string  |          |                                               |
| `ensure-newline` | boolean | yes      |                                               |
| `silent`         | boolean | yes      |                                               |

### Return values
=> HandlerTextSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/search-string-and-replace`
Does a text replacement in today's daily note.  The search term is used as-is, i.e. it's a string search.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter    | Value   | optional | Description                                   |
| ------------ | ------- | -------- | --------------------------------------------- |
| `replace`    | string  |          |                                               |
| `search`     | string  |          |                                               |
| `silent`     | boolean | yes      |                                               |

### Return values
=> HandlerTextSuccess | HandlerFailure

### Example
TODO

---

## `/daily-note/search-regex-and-replace`
Does a text replacement in today's daily note.  The search term is used as a pattern, i.e. it's a regular expression search.

### Parameters
In addition to the base parameters (see section "Parameters required in/ accepted by all calls") [in main doc](README.md#parameters-required-in-accepted-by-all-calls)):

| Parameter    | Value   | optional | Description                                   |
| ------------ | ------- | -------- | --------------------------------------------- |
| `replace`    | string  |          |                                               |
| `search`     | string  |          |                                               |
| `silent`     | boolean | yes      |                                               |

### Return values
=> HandlerTextSuccess | HandlerFailure
