<!-- NOTE: Keep this file updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# untyped

Schema resolution and code generation library. Converts runtime JS/TS configuration objects (with `$schema`, `$resolve`, `$default` metadata) into JSON Schema, TypeScript types, and Markdown documentation. Part of the [unjs](https://unjs.io) ecosystem.

## Architecture

Single npm package (not monorepo). ESM-only (v2.0+).

**Data flow:**

```
Input Object (with $schema, $resolve, $default)
  → resolveSchema() [recursive tree walk]
  → Normalized Schema (JSON-Schema compliant)
  → generateTypes()     → TypeScript interfaces
  → generateMarkdown()  → Markdown docs
  → applyDefaults()     → Resolved config
```

### Source layout

| Path | Purpose |
|---|---|
| `src/types.ts` | Core type definitions (`Schema`, `InputObject`, `TypeDescriptor`, `JSValue`) |
| `src/schema.ts` | Schema resolution engine (`resolveSchema`, `applyDefaults`, `normalizeSchema`) |
| `src/utils.ts` | Utilities: type inference, path resolution, object helpers, `defineUntypedSchema` |
| `src/generator/dts.ts` | TypeScript type generation (`generateTypes`) |
| `src/generator/md.ts` | Markdown doc generation (`generateMarkdown`) |
| `src/loader/loader.ts` | Dynamic schema loading from files via `jiti` |
| `src/loader/babel.ts` | Babel plugin for JSDoc metadata extraction from source |
| `src/cli.ts` | CLI (`untyped load <path> [--write] [--ignoreDefaults]`) using `citty` |
| `web/` | Vue 3 + Vite interactive playground |

### Exports

```
"."            → src/index.ts    (resolveSchema, generateTypes, generateMarkdown, applyDefaults, ...)
"./babel-plugin" → src/loader/babel.ts
"./loader"     → src/loader/loader.ts
```

## Development

**Setup:**

```bash
eval "$(fnm env --use-on-cd 2>/dev/null)"  # Enable node/corepack/pnpm
corepack enable
pnpm install
```

**Scripts:**

| Command | Description |
|---|---|
| `pnpm dev` | Interactive test watch mode (vitest) |
| `pnpm test` | Lint + test with coverage |
| `pnpm build` | Build with unbuild (rollup-based) |
| `pnpm lint` | oxlint + oxfmt check |
| `pnpm lint:fix` | automd + oxlint --fix + oxfmt |
| `pnpm web` | Start playground dev server |
| `pnpm release` | Test, changelog, publish |

### Build

Uses `unbuild` (see `build.config.ts`). Entries: `index`, `loader/babel`, `loader/loader`, `cli`. Babel deps are inlined and selectively minified via esbuild. Post-build cleanup removes `.d.ts` files, keeping only `.d.mts`.

### Testing

Vitest with `@vitest/coverage-v8`. Tests in `test/` directory.

| Test file | Covers |
|---|---|
| `schema.test.ts` | Schema resolution, type inference, required fields, caching |
| `types.test.ts` | TypeScript type generation, JSDoc, imports |
| `transform.test.ts` | Babel transform, JSDoc parsing, function metadata |
| `defaults.test.ts` | Default value application |
| `loader.test.ts` | Dynamic schema loading |
| `utils.test.ts` | Utility functions |

Run single test: `pnpm vitest run test/<file>.test.ts`

### Linting & Formatting

- **Linter:** oxlint (plugins: unicorn, typescript, oxc)
- **Formatter:** oxfmt
- Config: `.oxlintrc.json`, `.oxfmtrc.json`

### CI/CD

- `ci.yml` — lint, build, test with coverage, upload to Codecov (Node 22)
- `autofix.yml` — auto-fix lint/format on PRs, commit via autofix-ci
- `renovate.json` — automated dependency updates (extends `unjs/renovate-config`)

## Key Patterns

- **Special keys:** `$schema` (JSON Schema metadata), `$resolve` (normalizer function), `$default` (default value)
- **Recursive resolution:** `resolveSchema` walks input objects recursively, building JSON-Schema-compliant output with resolver caching
- **Type inference:** Multiple paths — runtime value analysis, JSDoc tags, TypeScript annotations
- **Babel plugin** (`src/loader/babel.ts`): Extracts JSDoc comments at build time, transforms function expressions into declarations with metadata. Handles `@type`, `@param`, `@returns` tags
- **No classes:** Composition with pure functions throughout

## Dependencies

| Package | Role |
|---|---|
| `citty` | CLI framework |
| `defu` | Object defaults merging |
| `jiti` | Dynamic TS/JS module loading |
| `knitwork` | String manipulation (object key escaping) |
| `scule` | Case transformers (pascalCase for type names) |
