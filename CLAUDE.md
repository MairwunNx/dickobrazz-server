# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and Cursor when working with code in this repository.

## Project Overview

Backend API for Dickobrazz (dickobrazz.com) — a Telegram bot with daily size, leaderboards, seasons, achievements, and analytics.

**Stack:** Bun (stable), TypeScript (strict), Bun.serve, MongoDB 8.2.3 (mongoose), Redis 8.4 (Bun.redis), Zod, YAML+dotenv, Biome, prom-client, Random.org (@randomorg/core) + crypto.getRandomValues fallback (urandom), typed-inject for DI with string raw tokens, FAA (Feature-Action Architecture).

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

This project follows **Feature-Action Architecture (FAA)** — a TypeScript/Bun adaptation of Feature-Sliced Design for backends. See `Feature-Action-Architecture/MANIFEST.md` for the full spec and `Feature-Action-Architecture/examples/ts-bun.md` for typed-inject examples. AI notes: `Feature-Action-Architecture/AI.md`.

### Layer Hierarchy (downward imports only)

```
App → Features → Entities → Shared
```

- **App** (`src/app/`): HTTP server, router, route factory, DI container, request context via AsyncLocalStorage.
- **Features** (`src/features/`): Business use cases. Each has `api/handler.ts`, `*.action.ts`, optionally `db/`, `lib/`, `types.ts`, `index.ts`.
- **Entities** (`src/entities/`): Domain objects. Each has `model.ts` (Mongoose schema), `dal.ts` (CRUD), optionally `cache.ts`, `lib/`, `types.ts`.
- **Shared** (`src/shared/`): Infrastructure (MongoDB, Redis, config, logging, metrics, random) and utilities (datetime, encoding, sync, API primitives).

## Core Rules

- Use Bun native APIs where possible (`Bun.serve`, `Bun.file`, `Bun.write(Bun.stdout, ...)`, `Bun.redis`).
- In Bun.serve, return `Response.json({ data })` directly (no manual Content-Type).
- Write to stdout via `Bun.write(Bun.stdout, "")`.
- Redis: use built-in `Bun.redis` only; do not add Redis dependencies.
- MongoDB: use mongoose only.
- Dependencies: add via `bun add`; run scripts via `bun run`.
- Logging: log starts, stops, connections, errors, and successful operations.
- All functions must be typed; avoid `any`.
- Operations use Moscow time (Europe/Moscow, UTC+3).
- Keep files small and LLM-friendly; single responsibility per file/function.
- No comments unless logic is non-obvious; comments can be in Russian.
- No classes — factory functions, closures, and functional programming only.
- Prefer one-liner routes and small, single-purpose functions.
- Use `using` for resource lifecycle where possible.
- Prefer returning tuples from services instead of try/catch-heavy flows.
- Route error handling through Bun.serve error handler, including Zod errors.
- External API calls must use timeouts via `AbortController`.
- Keep `/metrics` separate for prom-client; do not mix with API logic.
- Naming: Brief, descriptive, and consistent.

## Testing & Checks

- After any change, run: `bun run check:fix`, `bun run test`, `bun run typecheck`.
- Write tests for logic that is environment-independent.
- Use Russian language in test `it()` descriptions.

## Path Aliases (tsconfig.json)

```
@/*          → src/*
@/app/*      → src/app/*
@/features/* → src/features/*
@/entities/* → src/entities/*
@/shared/*   → src/shared/*
```

## Communication & Commits

- Communicate with user preferably in Russian; thinking in English is fine.
- Name commits shortly in Russian language.
- Use emoji before commit summary that describes the changes.

## References

- Bun types docs: `node_modules/bun-types/docs/*.md`
- typed-inject docs: `node_modules/typed-inject/README.md`
- random-org docs: `node_modules/random-org/README.md`
- prom-client docs: `node_modules/prom-client/README.md`
- mongoose docs: `node_modules/mongoose/README.md`
