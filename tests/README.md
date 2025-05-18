## Prerequisites / Assumptions for testing

Obsidian knows about the test vault which is named "plugin-test-vault" and located at `~/tmp/plugin-test-vault`. The vault has been configured and is ready to be used for testing.

For this, I created a test vault with that name and location, configured it to my liking (plugins, features, etc.). Then, I closed that vault, and moved it to this repository in `tests/plugin-test-vault.original`.

## Running tests

A test run will create a copy of the test vault (`tests/plugin-test-vault.original`) at the vault's location as set up in Obsidian: at `~/tmp/plugin-test-vault`. The tests are run against that copy. **The original vault is not modified by the tests.**

## Structure of the test vault

Test files (`*.test.ts`) and their related Markdown notes (`*.md`) and are stored in the test vault, side by side. The folders are named after Actions URI routes. For example, all files related to the tests of the route `/note/get` go into `tests/plugin-test-vault.original/note/get/`, e.g.

```
tests/
  plugin-test-vault.original/
    note/
      get/
        getNote.test.ts // test cases
        first-note.md
        second-note.md
        …
```

The test files are named after the route they are testing, e.g. `getNote.test.ts` tests the `/note/get` route.

TODO:

- [ ] add wrapper for XCU calls (parameters: route, payload) which handles sending and waiting for the response
- [ ] add function for looking up files in the vault folder which correlates to the route being tested
- [x] server shouldn't be started in every `.test.ts` file, but only once for all tests
