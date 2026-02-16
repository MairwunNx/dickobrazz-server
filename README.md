# Dickobrazz Server

[![AI Capable](https://img.shields.io/badge/AI-Capable-brightgreen?style=flat&logo=openai&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server)
[![Build Status](https://img.shields.io/github/actions/workflow/status/MairwunNx/dickobrazz-server/build.yml?branch=main&style=flat&logo=githubactions&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server/actions/workflows/build.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Runs on Bun](https://img.shields.io/badge/Runs_on-Bun-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![Runs with MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Runs with Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Available-2496ED?style=flat&logo=docker&logoColor=white)](https://github.com/MairwunNx/dickobrazz-server/pkgs/container/dickobrazz-server)
[![GitHub Release](https://img.shields.io/github/v/release/MairwunNx/dickobrazz-server?style=flat&logo=github&color=blue)](https://github.com/MairwunNx/dickobrazz-server/releases)

🌶️ Backend API для экосистемы Dickobrazz (dickobrazz.com): генерация ежедневного размера, лидерборды, сезоны, ачивки, респекты, динамика и сервисные метрики.

> [!NOTE]
> Проект использует Feature-Action Architecture (FAA): `App -> Features -> Entities -> Shared`.

## Фичи

### Аутентификация и безопасность

- Вход через Telegram Init Data (`/auth/login`)
- Поддержка 3 режимов auth: `session_token` cookie, `Bearer`, CSOT headers
- Protected/public эндпоинты с персонализацией ответов при наличии user-контекста

### Игровая логика Dickobrazz

- **Размер кока** (`/api/v1/cock/size`) — daily генерация размера
- **Линейка** (`/api/v1/cock/ruler`) — дейли лидерборд
- **Ладдер** (`/api/v1/cock/ladder`) — общий all-time рейтинг
- **Гонка** (`/api/v1/cock/race`) — сезонный лидерборд
- **Сезоны** (`/api/v1/cock/seasons`) — история сезонов и победителей
- **Ачивки и респекты** (`/api/v1/cock/achievements`, `/api/v1/cock/respects`)
- **Динамика** (`/api/v1/cock/dynamic/global`, `/api/v1/cock/dynamic/personal`)

### Наблюдаемость и инфраструктура

- `/health` для health checks
- `/metrics` для Prometheus
- CI: test, lint/check, typecheck, Docker build, release
- Готовые Dev Container и Docker Compose конфиги

## Использование API

### Базовый URL

- Local: `http://localhost:3030`

### Основные ручки

- `GET /health` — состояние сервиса
- `GET /metrics` — метрики в формате Prometheus
- `POST /auth/login` — авторизация через Telegram Init Data
- `GET /api/v1/me` — профиль текущего пользователя
- `PATCH /api/v1/me/privacy` — обновить приватность профиля
- `POST /api/v1/cock/size` — получить размер на сегодня
- `GET /api/v1/cock/ruler|race|ladder|seasons` — лидерборды/сезоны
- `GET /api/v1/cock/dynamic/global|personal` — аналитика
- `GET /api/v1/cock/achievements` — достижения
- `GET /api/v1/cock/respects` — детализация респектов

Полная спецификация API: `spec.yaml`
Коллекция для тестов: `postman.json`

## Конфигурация

Минимальные переменные окружения (см. `.env.draft`):

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

Ключевые секции `config.yaml`:

- `svc.port` — HTTP порт
- `svc.db.mongo.url` / `svc.db.redis.url` — подключения к БД
- `svc.rnd.rndorg` / `svc.rnd.urandom` — источники рандома
- `svc.csot.token` — межсервисный токен
- `svc.auth.*` — параметры сессий

> [!IMPORTANT]
> Во всех сценариях запуска ниже сначала настрой env-переменные (`.env` или `.devcontainer/devcontainer.env`) и проверь `config.yaml`.

## Запуск и деплоймент 🚀

### Перед началом 📦

Если репозиторий еще не клонирован:

```bash
git clone https://github.com/MairwunNx/dickobrazz-server.git
cd dickobrazz-server
```

---

### Dev Containers (рекомендуется для разработки и запуска в dev среде) 🧰

**Требования**:

- Запущенный **Docker**
- Минимум **1 GB** оперативной памяти под контейнер разработки
- VS Code/Cursor/Goland с поддержкой dev containers (или CLI-утилита)

> [!IMPORTANT]
> Перед запуском dev container обязательно заполни `.devcontainer/devcontainer.env`, затем проверь соответствие значений в `config.yaml`.

**Переменные окружения**:

- Файл: `.devcontainer/devcontainer.env`
- Минимум нужны:

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

**Как открыть** _(VS Code/Cursor/Goland)_:

1. Открой проект в VS Code/Cursor/Goland
2. Найди действие **Reopen in Container** и запусти его

Твой инструмент разработки автоматически соберет и запустит dev-контейнеры.

**Запуск сервера внутри dev контейнера**:

```bash
bun install
bun run dev
```

> [!NOTE]
> В dev-контейнере проброшены порты `3030`, `27017`, `6379`. Для быстрого smoke-check можно использовать `GET /health`.

---

### Локальный запуск через Bun (`bun run start`) ⚡

> [!IMPORTANT]
> Для этого сценария нужны запущенные MongoDB и Redis, корректный `.env` и актуальный `config.yaml`.

1. Создай `.env` на основе шаблона:

```bash
cp .env.draft .env
```

2. Установи зависимости:

```bash
bun install
```

3. Запусти сервер:

```bash
bun run start
```

Сервис будет доступен по адресу: `http://localhost:3030`

> [!NOTE]
> Для разработки с hot reload используй `bun run dev`.

---

### Использование готового образа 🧩 (продакшн)

Используй готовый образ из GitHub Container Registry:

```yaml
services:
  dickobrazz-server:
    image: ghcr.io/mairwunnx/dickobrazz-server:latest
    env_file: .env
    ports:
      - "3030:3030"
```

> [!IMPORTANT]
> Перед стартом контейнера убедись, что все env-переменные в `.env` заданы, а `config.yaml` соответствует окружению (подключения к БД, auth/csot, rnd-провайдеры).

### Через Docker Compose (app + mongo + redis) 🐳

Этот вариант поднимает сервер вместе с MongoDB и Redis:

```bash
docker compose up -d
```

Сервисы:

- `dickobrazz-server` — API (`3030`)
- `dickobrazz-mongo` — MongoDB (`27017`)
- `dickobrazz-redis` — Redis (`6379`)

> [!NOTE]
> `docker-compose.yaml` использует `.env` и монтирует `config.yaml` в контейнер как read-only.

## Команды разработки

```bash
bun run dev        # запуск в watch-режиме
bun run start      # обычный запуск
bun run build      # сборка в dist/index.js
bun run test       # тесты
bun run check      # biome checks
bun run check:fix  # автофикс biome
bun run typecheck  # проверка TS типов
```

Рекомендуемый прогон после изменений:

```bash
bun run check:fix && bun run test && bun run typecheck
```

## Стек

- **Bun** — runtime, package manager, test runner
- **TypeScript (strict)** — типобезопасность
- **Bun.serve** — HTTP сервер
- **MongoDB + Mongoose** — основное хранилище
- **Redis (Bun.redis)** — кэш/быстрые операции
- **Zod** — валидация схем
- **typed-inject** — dependency injection
- **prom-client** — Prometheus метрики
- **Random.org + urandom fallback** — генерация случайностей
- **Biome** — lint/format/check

## Архитектура

Проект следует FAA-подходу:

- `src/app` — bootstrap, DI, роутинг, pipeline
- `src/features` — use-case логика по фичам
- `src/entities` — доменные сущности, DAL, модели
- `src/shared` — инфраструктура и общие библиотеки

Подробнее: `Feature-Action-Architecture/README.md`

## Ссылки на проекты из той же экосистемы

[dickobrazz](https://github.com/MairwunNx/dickobrazz) —  🌶️ Современный и технологичный кокомер: вы спрашиваете, а бот выдаёт научно обоснованный размер и даже в шуточной форме сопоставляет ваш размер агрегата с номером региона России. Линейка или микроскоп, больше не понадобиться!

## Ссылки на связанные проекты

[Emperor Xi](https://github.com/mairwunnx/xi) — 🀄️ Telegram-бот с ИИ, стилизованный под великого императора Xi. Личный помощник великого лидера, готовый отвечать на вопросы простого народа.

---

<img src="./media.png" alt="Русская сила" width="500">

🇷🇺 **Сделано в России с любовью.** ❤️

**Dickobrazz Server** — это про честный рандом, здоровую конкуренцию и прозрачную статистику.

> 🫡 Made by Pavel Erokhin (Павел Ерохин), aka mairwunnx.
