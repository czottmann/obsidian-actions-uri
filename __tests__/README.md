## Prerequisites / Assumptions for testing

Obsidian knows about the test vault which is named "plugin-test-vault" and located at `~/tmp/plugin-test-vault`. The vault has been configured and is ready to be used for testing.

For this, I created a test vault with that name and location, configured it to my liking (plugins, features, etc.). Then, I closed that vault, and moved it to this repository in `__tests__/plugin-test-vault.original`.

## Running tests

A test run will create a copy of the test vault (`__tests__/plugin-test-vault.original`) at the vault's location as set up in Obsidian: at `~/tmp/plugin-test-vault`. The tests are run against that copy. **The original vault is not modified by the tests.**
