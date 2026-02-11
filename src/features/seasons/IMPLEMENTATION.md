# Seasons — Кок-сезоны

## Обзор

Фича показывает список всех завершённых и текущих сезонов с победителями каждого. Сезон длится 3 месяца, отсчёт от даты первого кока в системе. Для каждого завершённого сезона показываются топ-3 победителя.

## Тип ответа (уже готов, НЕ менять)

```typescript
// src/features/seasons/types.ts
interface CockSeasonsResponse {
  seasons: SeasonWithWinners[];   // Массив сезонов от НОВЫХ к СТАРЫМ (по сути, на одной странице, один сезон!)
  page: PageMeta;
}

interface SeasonInfo {
  season_num: number;
  start_date: string;   // ISO string
  end_date: string;     // ISO string
  is_active: boolean;
}

interface SeasonWinner {
  user_id: number;
  nickname: string;
  total_size: number;   // Суммарный размер за сезон
  place: number;        // 1, 2, 3
}

interface SeasonWithWinners extends SeasonInfo {
  winners: SeasonWinner[];   // Топ-3 (для завершённых), пусто для активного
}
```

## Зависимости (inject)

```typescript
export const createGetSeasonsAction = (cockDal: CockDal, userDal: UserDal) =>
  async (params: { limit?: number; page?: number }): Promise<CockSeasonsResponse>
```

## Логика определения сезонов

Та же, что в Race. Рекомендуется вынести общую функцию `getAllSeasons(firstCockDate)` в shared или entities.

Ключевые моменты:
- Сезон = 3 месяца
- Нумерация с 1
- `is_active = true` если текущая дата (по Москве) попадает в `[startDate, endDate)`
- Максимум сезонов для отображения: 14 (как в Go: `MaxSeasonsToShow = 14`)

## Пайплайны MongoDB (уже готовы в `db/pipelines.ts`)

- `pFirstCockDate()` — дата первого кока
- `pSeasonWinners(startDate, endDate)` — топ-3 юзеров сезона (суммарный size DESC, limit 3)
- `pTopUsersInSeason(startDate, endDate, limit, page)` — все юзеры сезона с пагинацией
- `pSeasonCockersCount(startDate, endDate)` — кол-во участников сезона

## Алгоритм

### 1. Получить дату первого кока

```typescript
const firstCockResult = await cockDal.aggregate(pFirstCockDate());
const firstCockDate = firstCockResult[0]?.first_date;

if (!firstCockDate) {
  return { seasons: [], page: createPageMeta(limit, 0, page) };
}
```

### 2. Вычислить все сезоны

```typescript
let allSeasons = getAllSeasons(firstCockDate);

// Ограничить максимум 14 последних сезонов
if (allSeasons.length > 14) {
  allSeasons = allSeasons.slice(allSeasons.length - 14);
}
```

### 3. Порядок: от НОВЫХ к СТАРЫМ

В Go-боте отображение начинается с последнего сезона (самого нового). API должен возвращать массив от новых к старым:

```typescript
allSeasons.reverse(); // Теперь [newest, ..., oldest]
```

### 4. Пагинация по сезонам

```typescript
const limit = params.limit || 14;
const page = params.page || 1;
const start = (page - 1) * limit;
const paginatedSeasons = allSeasons.slice(start, start + limit);
```

### 5. Для каждого сезона получить победителей

Параллельно для каждого сезона:

```typescript
const seasonsWithWinners = await Promise.all(
  paginatedSeasons.map(async (season) => {
    let winners: SeasonWinner[] = [];

    if (!season.is_active) {
      // Победители только для завершённых сезонов
      const startDate = new Date(season.start_date);
      const endDate = new Date(season.end_date);
      const rawWinners = await cockDal.aggregate(pSeasonWinners(startDate, endDate));

      winners = rawWinners.map((w, idx) => ({
        user_id: w._id,
        nickname: normalizeNickname(w._id, w.nickname), // нормализовать
        total_size: w.total_size,
        place: idx + 1,
      }));
    }

    return {
      season_num: season.season_num,
      start_date: season.start_date,
      end_date: season.end_date,
      is_active: season.is_active,
      winners,
    };
  })
);
```

### 6. Нормализовать ники победителей

Собрать все user_id победителей → batch-запросом получить юзеров → нормализовать.

### 7. Собрать ответ

```typescript
return {
  seasons: seasonsWithWinners,
  page: createPageMeta(limit, allSeasons.length, page),
};
```

## Кок-респект (информация для контекста)

В Go-боте есть система "кок-респектов" — очков за участие в сезонах. Формула:

```typescript
function calculateCockRespect(place: number): number {
  if (place <= 0) return 0;
  if (place === 1) return 1488;
  const score = Math.floor(3000 / Math.pow(place, 1.2));
  return Math.max(score, 1);
}
```

Это используется в динамике, но не в самих сезонах. Сезоны просто показывают победителей.

## Корнер-кейсы

1. **Нет коков** — пустой массив seasons.
2. **Один сезон (текущий)** — `seasons: [{ ..., is_active: true, winners: [] }]`.
3. **Активный сезон** — winners пуст (мы НЕ показываем промежуточные результаты как "победителей").
4. **Скрытые пользователи** — nickname = AnonymXXXX.
5. **Менее 3 участников в сезоне** — winners может содержать 1 или 2 записи.

## Порядок данных

- Seasons: от **новых** к **старым** (reverse chronological)
- Winners внутри сезона: по `total_size DESC` (place 1, 2, 3)

## Структура файлов

```
src/features/seasons/
├── api/handler.ts           # уже есть
├── get-seasons.action.ts    # ← реализовать
├── db/pipelines.ts          # уже есть
├── types.ts                 # уже есть
└── index.ts                 # уже есть
```

## Заметка: normalizeNickname

> **Важно:** `normalizeNickname` — маска на выход. В БД всегда хранится оригинальный username. Нормализация применяется только при формировании API-ответа.
