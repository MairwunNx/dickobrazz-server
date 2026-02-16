# Dickobrazz Server

[![AI Capable](https://img.shields.io/badge/AI-Capable-brightgreen?style=flat&logo=openai&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server)
[![Build Status](https://img.shields.io/github/actions/workflow/status/MairwunNx/dickobrazz-server/build.yml?branch=main&style=flat&logo=githubactions&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server/actions/workflows/build.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Runs on Bun](https://img.shields.io/badge/Runs_on-Bun-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![Runs with MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Runs with Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Available-2496ED?style=flat&logo=docker&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server/pkgs/container/dickobrazz-server)
[![GitHub Release](https://img.shields.io/github/v/release/MairwunNx/dickobrazz-server?style=flat&logo=github&color=blue)](https://github.com/MairwunNx/dickobrazz-server/releases)

**Language**: 🇺🇸 English | [🇷🇺 Русский](README.RU.md)

🌶️ Backend API for the Dickobrazz ecosystem (dickobrazz.com): daily size generation, leaderboards, seasons, achievements, respects, progression analytics, and service metrics.

> [!NOTE]
> The project uses Feature-Action Architecture (FAA): `App -> Features -> Entities -> Shared`.

## Features

### Authentication and Security

- Login via Telegram Init Data (`/auth/login`)
- Supports 3 auth modes: `session_token` cookie, `Bearer`, CSOT headers
- Protected/public endpoints with personalized responses when a user context is present

### Dickobrazz Game Logic

- **Cock Size** (`/api/v1/cock/size`) - daily size generation
- **Ruler** (`/api/v1/cock/ruler`) - daily leaderboard
- **Ladder** (`/api/v1/cock/ladder`) - global all-time ranking
- **Race** (`/api/v1/cock/race`) - seasonal leaderboard
- **Seasons** (`/api/v1/cock/seasons`) - seasons and winners history
- **Achievements and Respects** (`/api/v1/cock/achievements`, `/api/v1/cock/respects`)
- **Dynamics** (`/api/v1/cock/dynamic/global`, `/api/v1/cock/dynamic/personal`)

### Observability and Infrastructure

- `/health` for health checks
- `/metrics` for Prometheus
- CI: test, lint/check, typecheck, Docker build, release
- Ready-to-use Dev Container and Docker Compose configs

## API Usage

### Base URL

- Local: `http://localhost:3030`

### Main Endpoints

- `GET /health` - service status
- `GET /metrics` - Prometheus-formatted metrics
- `POST /auth/login` - authorization via Telegram Init Data
- `GET /api/v1/me` - current user profile
- `PATCH /api/v1/me/privacy` - update profile privacy
- `POST /api/v1/cock/size` - get today's size
- `GET /api/v1/cock/ruler|race|ladder|seasons` - leaderboards/seasons
- `GET /api/v1/cock/dynamic/global|personal` - analytics
- `GET /api/v1/cock/achievements` - achievements
- `GET /api/v1/cock/respects` - respects details

Full API specification: `spec.yaml`
Test collection: `postman.json`

## Configuration

Minimum environment variables (see `.env.draft`):

```bash
MONGO_URL=mongodb://localhost:27017/dickobrazz
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password-here
RANDOMORG_TOKEN=your-api-key-here
TELEGRAM_BOT_TOKEN=your-bot-token-here
CROSS_SERVER_TOKEN=generate-secure-token-here
SESSION_SECRET=generate-strong-session-secret-here
SESSION_TTL_SEC=604800
```

Key `config.yaml` sections:

- `svc.port` - HTTP port
- `svc.db.mongo.url` / `svc.db.redis.url` - DB connections
- `svc.rnd.rndorg` / `svc.rnd.urandom` - random providers
- `svc.csot.token` - cross-service token
- `svc.auth.*` - session settings

> [!IMPORTANT]
> For all run scenarios below, configure environment variables first (`.env` or `.devcontainer/devcontainer.env`) and validate `config.yaml`.

## Run and Deployment 🚀

### Before You Start 📦

If the repository is not cloned yet:

```bash
git clone https://github.com/MairwunNx/dickobrazz-server.git
cd dickobrazz-server
```

---

### Dev Containers (recommended for development and dev runtime) 🧰

**Requirements**:

- Running **Docker**
- At least **1 GB** of RAM for the development container
- VS Code/Cursor/Goland with dev containers support (or CLI utility)

> [!IMPORTANT]
> Before starting the dev container, fill in `.devcontainer/devcontainer.env`, then verify values in `config.yaml`.

**Environment Variables**:

- File: `.devcontainer/devcontainer.env`
- Minimum required:

```bash
MONGO_URL=mongodb://dickobrazz-mongo:27017/dickobrazz
REDIS_URL=redis://:your-redis-password-here@dickobrazz-redis:6379
REDIS_PASSWORD=your-redis-password-here
RANDOMORG_TOKEN=your-api-key-here
TELEGRAM_BOT_TOKEN=your-bot-token-here
CROSS_SERVER_TOKEN=generate-secure-token-here
SESSION_SECRET=generate-strong-session-secret-here
SESSION_TTL_SEC=604800
```

**How to open** _(VS Code/Cursor/Goland)_:

1. Open the project in VS Code/Cursor/Goland
2. Find and run **Reopen in Container**

Your IDE will automatically build and start dev containers.

**Run the server inside dev container**:

```bash
bun install
bun run dev
```

> [!NOTE]
> In the dev container, ports `3030`, `27017`, and `6379` are exposed. For a quick smoke check, use `GET /health`.

---

### Local Run with Bun (`bun run start`) ⚡

> [!IMPORTANT]
> This scenario requires running MongoDB and Redis, a valid `.env`, and an up-to-date `config.yaml`.

1. Create `.env` from template:

```bash
cp .env.draft .env
```

2. Install dependencies:

```bash
bun install
```

3. Start the server:

```bash
bun run start
```

Service will be available at: `http://localhost:3030`

> [!NOTE]
> For development with hot reload, use `bun run dev`.

---

### Use Prebuilt Image 🧩 (production)

Use the prebuilt image from GitHub Container Registry:

```yaml
services:
  dickobrazz-server:
    image: ghcr.io/mairwunnx/dickobrazz-server:latest
    env_file: .env
    ports:
      - "3030:3030"
```

> [!IMPORTANT]
> Before starting the container, make sure all environment variables in `.env` are set and `config.yaml` matches your environment (DB connections, auth/csot, random providers).

### Via Docker Compose (app + mongo + redis) 🐳

This option starts the server together with MongoDB and Redis:

```bash
docker compose up -d
```

Services:

- `dickobrazz-server` - API (`3030`)
- `dickobrazz-mongo` - MongoDB (`27017`)
- `dickobrazz-redis` - Redis (`6379`)

> [!NOTE]
> `docker-compose.yaml` uses `.env` and mounts `config.yaml` into the container as read-only.

## Development Commands

```bash
bun run dev        # run in watch mode
bun run start      # normal run
bun run build      # build to dist/index.js
bun run test       # tests
bun run check      # biome checks
bun run check:fix  # biome autofix
bun run typecheck  # TypeScript type check
```

Recommended run after changes:

```bash
bun run check:fix && bun run test && bun run typecheck
```

## Stack

- **Bun** - runtime, package manager, test runner
- **TypeScript (strict)** - type safety
- **Bun.serve** - HTTP server
- **MongoDB + Mongoose** - primary storage
- **Redis (Bun.redis)** - cache/fast operations
- **Zod** - schema validation
- **typed-inject** - dependency injection
- **prom-client** - Prometheus metrics
- **Random.org + urandom fallback** - randomness generation
- **Biome** - lint/format/check

## Architecture

The project follows FAA:

- `src/app` - bootstrap, DI, routing, pipeline
- `src/features` - feature use-case logic
- `src/entities` - domain entities, DAL, models
- `src/shared` - infrastructure and shared libraries

More details: `Feature-Action-Architecture/README.md`

## Links to Projects from the Same Ecosystem

[dickobrazz](https://github.com/MairwunNx/dickobrazz) - 🌶️ Modern and tech-driven cockometer: you ask, and the bot returns a scientifically grounded size and even humorously compares your aggregate size to a Russian region code. Ruler or microscope, no longer needed!

## Links to Related Projects

[Emperor Xi](https://github.com/mairwunnx/xi) - 🀄️ AI-powered Telegram bot styled after Emperor Xi. A personal assistant for the great leader, ready to answer questions from ordinary people.

---

<img src="./media.png" alt="Russian power" width="500">

🇷🇺 **Made in Russia with love.** ❤️

**Dickobrazz Server** is about fair randomness, healthy competition, and transparent statistics.

> 🫡 Made by Pavel Erokhin, aka mairwunnx.
