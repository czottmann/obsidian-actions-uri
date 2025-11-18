# AGENTS.md

This file provides guidance to LLM agents when working with code in this repository.

## Common Development Commands

### Building and Development
- **Development**: `pnpm dev` or `npm run dev` - Compiles with esbuild and watches for changes
- **Production build**: `pnpm build` or `npm run build` - TypeScript type checking + production build
- **Testing**: `pnpm test` or `npm test` - Runs Jest tests (requires build first)

### Single Test Execution
Use Jest's pattern matching: `npx jest noteCreate.test.ts` or `npx jest --testNamePattern="specific test name"`

## Architecture Overview

This is an Obsidian plugin that extends the built-in URI scheme with additional x-callback-url endpoints for advanced automation. The plugin follows a modular routing architecture:

### Core Components

**Main Plugin (`src/main.ts`)**: 
- Extends Obsidian's `Plugin` class as `ActionsURI`
- Registers URI handlers dynamically from route definitions
- Handles parameter validation using Zod schemas
- Manages x-callback-url responses and error handling

**Routing System (`src/routes.ts`, `src/routes/`)**: 
- Each route module exports a `routePath` object defining available endpoints
- Routes are organized by functionality (note, file, vault, search, etc.)
- Each route has a Zod schema for validation and a handler function
- Route pattern: `/actions-uri/{category}/{action}`

**Schema Validation (`src/schemata.ts`, `src/utils/zod.ts`)**:
- All incoming parameters validated with Zod
- Base parameters include vault, action, debug-mode, x-success/x-error callbacks
- Note targeting supports file paths, UIDs, or periodic notes

**Result Handling (`src/utils/results-handling.ts`)**:
- Standardized success/failure result objects
- Automatic x-callback-url responses
- Error codes and user-friendly messages

### Key Patterns

**Handler Functions**: Each route handler follows the pattern:
```typescript
async function handler(params: ValidatedParams): Promise<HandlerResult>
```

**Parameter Processing**: 
1. Raw parameters → Zod validation → Type-safe handler parameters
2. File path resolution using Obsidian's vault API
3. Support for targeting notes by file path, UID (frontmatter), or periodic note type

**Error Handling**: 
- Zod validation errors converted to user-friendly messages
- Handler exceptions caught and converted to standard error responses
- Optional UI notices (can be suppressed with `hide-ui-notice-on-error`)

## File Organization

- `src/routes/` - Individual route handlers organized by functionality
- `src/utils/` - Shared utilities (file handling, search, UI, callbacks)
- `src/types/` - TypeScript type definitions split by domain
- `tests/` - Jest tests with mock Obsidian environment
- `docs/` - Documentation (deployed to GitHub Pages)

## Testing Architecture

Tests use a custom setup that mocks the Obsidian environment:
- `tests/global-setup.ts` - Initializes mock environment and callback server
- Tests are serialized (`maxConcurrency: 1`) to avoid callback server conflicts
- Test vault in `tests/plugin-test-vault.original/` with sample notes and templates

## Dependencies

- **Zod**: Runtime type validation and schema definition
- **Obsidian API**: Plugin API, file system, and UI integration
- **Jest + ts-jest**: Testing framework with TypeScript support
- **esbuild**: Fast bundling for development and production
