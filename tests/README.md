# Test Setup Documentation

This document explains the setup and structure of the test environment for the Obsidian Actions URI plugin.

## Prerequisites / Assumptions for Testing

The test suite assumes that Obsidian is installed and configured to know about a test vault named "plugin-test-vault" located at `~/tmp/plugin-test-vault`. This vault should be configured as needed for testing various plugin features.

A blueprint of this test vault is stored in this repository at `tests/plugin-test-vault.original`.

## Running Tests

[Jest](https://jestjs.io) is used as the test runner. The test suite utilizes global setup and teardown scripts to manage the test environment.

A test run performs the following steps:

### 1. Global Setup (`tests/global-setup.ts`)

- Ensures the `~/tmp` directory exists.
- Removes any existing test vault at `~/tmp/plugin-test-vault`.
- Copies the blueprint vault from `tests/plugin-test-vault.original` to `~/tmp/plugin-test-vault`.
- Ensures the Actions URI plugin is enabled in the copied vault's `community-plugins.json`.
- Copies the compiled plugin files (`main.js`, `manifest.json`) into the test vault's plugin directory.
- Opens the copied vault in Obsidian using a `obsidian://open` URI.
- Starts a local HTTP callback server on port 3000 (`tests/callback-server.ts`).

### 2. Test Execution (`*.test.ts` files)

- Jest runs the test files.
- Tests interact with the Obsidian plugin by sending `obsidian://actions-uri/…` URIs.
- Tests use helper functions (`tests/helpers.ts`) to send URIs and wait for callbacks.

### 3. Global Teardown (`tests/global-teardown.ts`)

- Signals Obsidian to close the test vault using a `obsidian://actions-uri/vault/close` URI.
- Removes the temporary test vault directory at `~/tmp/plugin-test-vault`.
- Stops the local HTTP callback server.

**Important:** The original vault at `tests/plugin-test-vault.original` is **not** modified by the tests.

## XCU Call Flow in Tests

The test suite simulates user interaction by sending Obsidian Actions URIs. The process involves the following steps:

1. **Initiating the Call:** A test case calls the `callObsidian()` helper function (`tests/helpers.ts`), providing the desired route path and any necessary payload parameters.
2. **URI Construction:** The `callObsidian()` function constructs a full `obsidian://actions-uri/…` URI. This URI includes the test vault name and sets the `x-success` and `x-error` callback parameters to point to the `/success` and `/failure` endpoints of the local callback server running on port 3000.
3. **Sending the URI:** The constructed URI is opened using the `sendUri()` helper function, which uses OS-specific commands (`open`, `start`, `xdg-open`) to trigger Obsidian to handle the URI.
4. **Obsidian Processing:** Obsidian receives the URI and the Actions URI plugin processes the requested route.
5. **Sending Callback:** Based on the outcome of processing the route, the Actions URI plugin sends an HTTP GET request to either the `x-success` or `x-error` URL specified in the original URI. Depending on the environment, that request is sent either using `window.open()` (live) or `fetch()` (testing). (See `sendCallbackResult()` in `src/utils/callbacks.ts`.)
6. **Receiving Callback:** The local callback server (`tests/callback-server.ts`) receives the HTTP request on either the `/success` or `/failure` endpoint.
7. **Resolving Promise:** The `waitForCallback()` method in the `CallbackServer` instance, which `callObsidian()` is awaiting, receives the data from the incoming request and resolves the promise.
8. **Processing Result:** The `callObsidian()` function receives the data from the resolved promise, determines if it was a success or failure callback based on the received data structure, and returns a `Result` object (`tests/types.d.ts`) containing the outcome.
9. **Assertions:** The test case then uses the returned `Result` object to make assertions about the success or failure of the call and the received data.

## Structure of the Test Vault and Test Files

Test files (`*.test.ts`) and their related Markdown notes (`*.md`) are organized within the `tests/plugin-test-vault.original/` directory. The folder structure within `plugin-test-vault.original` mirrors the Actions URI routes being tested.

For example, files related to testing the `/note/get` route are located in `tests/plugin-test-vault.original/note/get/`. This directory contains the test file (`noteGet.test.ts`) and any Markdown notes (`.md` files) required for those specific tests.

```
tests/
  plugin-test-vault.original/
    note/
      get/
        noteGet.test.ts // Test cases for the `/note/get` route
        first-note.md   // Markdown note used in noteGet.test.ts
        second-note.md  // Another Markdown note used in noteGet.test.ts
    dataview/
      list/
        dataviewList.test.ts // Test cases for the `/dataview/list` route
        // … any necessary files for `dataview/list` tests
    // … other routes
```

The test files are typically named after the route they are testing (e.g., `noteGet.test.ts` for the `/note/get` route).

## Key Components

- **`tests/plugin-test-vault.original/`**: The blueprint of the Obsidian vault used for testing. Copied to a temporary location before each test run.
- **`tests/global-setup.ts`**: Jest global setup script. Handles creating and configuring the temporary test vault and starting the callback server.
- **`tests/global-teardown.ts`**: Jest global teardown script. Handles cleaning up the temporary test vault and stopping the callback server.
- **`tests/callback-server.ts`**: A simple HTTP server that listens for `x-success` (`/success`) and `x-error` (`/failure`) callbacks from the Obsidian plugin.
- **`tests/helpers.ts`**: Contains helper functions for the tests, including `sendUri` (to open Obsidian URIs) and `callObsidian` (to send an Actions URI and wait for a callback, returning a `Result` type).
- **`tests/types.d.ts`**: Defines custom types used in the tests, such as the `Result<T, E>` type for handling success and error outcomes.

## TODO

- [ ] add function for looking up files in the vault folder which correlates to the route being tested
