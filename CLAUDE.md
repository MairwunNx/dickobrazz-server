# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Development with watch mode
bun run start        # Production run
bun run build        # Bundle to dist/index.js
bun run check:fix    # Fix linting/formatting (Biome)
bun run test         # Run tests
bun run typecheck    # TypeScript type checking
```

After any change, run: `bun run check:fix && bun run test && bun run typecheck`

## Architecture

This project follows **Feature-Action Architecture (FAA)** — a TypeScript/Bun adaptation of Feature-Sliced Design for backends. See `Feature-Action-Architecture/MANIFEST.md` for the full spec and `Feature-Action-Architecture/examples/ts-bun.md` for typed-inject examples.

### Layer Hierarchy (downward imports only)

```
App → Features → Entities → Shared
```

- **App** (`application/server/`, moving to `src/app/`): HTTP server, router, route factory, DI container, request context via AsyncLocalStorage.
- **Features** (`application/features/`): Business use cases. Each has `api/handler.ts`, `*.action.ts`, optionally `db/`, `lib/`, `types.ts`, `index.ts`.
- **Entities** (`application/entities/`): Domain objects. Each has `model.ts` (Mongoose schema), `dal.ts` (CRUD), optionally `cache.ts`, `lib/`, `types.ts`.
- **Shared** (`application/shared/`): Infrastructure (MongoDB, Redis, config, logging, metrics, random) and utilities (datetime, encoding, sync, API primitives).

### DI Pattern

Uses `typed-inject` with string tokens:

```typescript
export function createUserEntity(mongo: MongoConnection) { ... }
createUserEntity.inject = ["mongo"] as const;

export function createLoginAction(userEntity: UserEntity, config: Config) { ... }
createLoginAction.inject = ["userEntity", "config"] as const;
```

Container assembled in `app/container.ts`.

### Key Rules

- Bun native APIs only: `Bun.serve`, `Bun.file`, `Bun.write(Bun.stdout, ...)`, `Bun.redis`
- No classes — factory functions and closures only
- All functions fully typed, no `any`
- Moscow time (Europe/Moscow, UTC+3) for all operations
- Route errors through `Bun.serve` error handler (including Zod)
- External API calls must use `AbortController` for timeouts
- Return `Response.json({ data })` directly (no manual Content-Type)
- Prefer tuples from services over try/catch-heavy flows
- Use Russian in test `it()` descriptions

## Path Aliases (tsconfig.json)

```
@/*         → src/*
@/app/*     → src/app/*
@/features/* → src/features/*
@/entities/* → src/entities/*
@/shared/*  → src/shared/*
```
