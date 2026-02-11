# Dynamics — Кок-динамика (общая и персональная)

## Обзор

Фича показывает статистику и аналитику по кокам. Есть два эндпоинта:
1. **Global** — общая статистика (без привязки к юзеру)
2. **Personal** — персональная + общая статистика для конкретного юзера

В Go-боте всё это одна большая $facet агрегация. На сервере мы разделяем на отдельные пайплайны и выполняем параллельно.

## Типы ответа (уже готовы, НЕ менять)

```typescript
// src/features/dynamics/types.ts

// Общая динамика (для глобального и персонального ответа)
interface CockDynamicOverall {
  total_size: number;           // Суммарный размер всех коков за всё время
  unique_users: number;         // Кол-во уникальных участников
  recent: {
    average: number;            // Средний размер (послед. 5 дней всех юзеров)
    median: number;             // Медианный размер (послед. 5 дней)
  };
  distribution: {
    huge_percent: number;       // % коков >= 19 см (послед. 5 дней)
    little_percent: number;     // % коков < 19 см
  };
  record: {
    requested_at: string;       // ISO дата рекордного дня
    total: number;              // Суммарный размер за рекордный день
  };
  total_cocks_count: number;    // Общее кол-во коков (записей)
  growth_speed: number;         // Скорость роста (средний дневной прирост за 5 дней)
}

// Персональная динамика
interface CockDynamicIndividual {
  total_size: number;           // Суммарный размер юзера
  recent_average: number;       // Средний из послед. 5 коков юзера
  irk: number;                  // Индекс Рандомного Кока (0-1, log ratio)
  record: {
    requested_at: string;       // Дата рекордного кока юзера
    total: number;              // Размер рекордного кока
  };
  dominance: number;            // % доминирования (доля юзера в общем)
  daily_growth_average: number; // Средний дневной прирост за 5 коков
  daily_dynamics: {
    yesterday_cock_change: number;          // Изменение послед. vs пред-пред.
    yesterday_cock_change_percent: number;  // То же в %
  };
  five_cocks_dynamics: {
    five_cocks_change: number;              // Изменение за 5 коков
    five_cocks_change_percent: number;      // То же в %
  };
  growth_speed: number;         // Средний размер за день (послед. 5 дней)
  first_cock_date: string;      // ISO дата первого кока юзера
  luck_coefficient: number;     // Коэфф. везения (avg/30.5 за послед. 5)
  volatility: number;           // Стандартное отклонение послед. 5 коков
  cocks_count: number;          // Кол-во коков юзера
}

// Ответ глобальной динамики
interface CockDynamicGlobalResponse {
  overall: CockDynamicOverall;
}

// Ответ персональной динамики
interface CockDynamicResponse {
  overall: CockDynamicOverall;
  individual: CockDynamicIndividual;
}
```

## Зависимости (inject)

```typescript
// Глобальная
export const createGetDynamicGlobalAction = (cockDal: CockDal) =>
  async (): Promise<CockDynamicGlobalResponse>

// Персональная
export const createGetDynamicPersonalAction = (cockDal: CockDal) =>
  async (userId: number): Promise<CockDynamicResponse>
```

## Пайплайны MongoDB (уже готовы в `db/pipelines.ts`)

### Общие (Overall)

| Пайплайн | Что возвращает | Поле в ответе |
|---|---|---|
| `pOverallTotal()` | `{ size }` | `overall.total_size` |
| `pUniqueUsers()` | `{ count }` | `overall.unique_users` |
| `pOverallRecent()` | `{ average, median }` | `overall.recent` |
| `pDistribution()` | `{ huge, little }` | `overall.distribution` |
| `pRecord()` | `{ requested_at, total }` | `overall.record` |
| `pTotalCocksCount()` | `{ total_count }` | `overall.total_cocks_count` |
| `pOverallGrowthSpeed()` | `{ growth_speed }` | `overall.growth_speed` |

### Персональные (Individual)

| Пайплайн | Что возвращает | Поле в ответе |
|---|---|---|
| `pUserTotal(userId)` | `{ total }` | `individual.total_size` |
| `pUserRecent(userId)` | `{ average }` | `individual.recent_average` |
| `pIrk(userId)` | `{ irk }` | `individual.irk` |
| `pUserRecord(userId)` | `{ requested_at, total }` | `individual.record` |
| `pDominance(userId)` | `{ dominance }` | `individual.dominance` |
| `pDailyGrowth(userId)` | `{ average }` | `individual.daily_growth_average` |
| `pDailyDynamics(userId)` | `{ yesterday_cock_change, yesterday_cock_change_percent }` | `individual.daily_dynamics` |
| `pFiveCocksDynamics(userId)` | `{ five_cocks_change, five_cocks_change_percent }` | `individual.five_cocks_dynamics` |
| `pUserGrowthSpeed(userId)` | `{ growth_speed }` | `individual.growth_speed` |
| `pUserFirstCockDate(userId)` | `{ first_date }` | `individual.first_cock_date` |
| `pLuck(userId)` | `{ luck_coefficient }` | `individual.luck_coefficient` |
| `pVolatility(userId)` | `{ volatility }` | `individual.volatility` |
| `pUserCocksCount(userId)` | `{ user_count }` | `individual.cocks_count` |

## Алгоритм — Global

### 1. Выполнить все overall пайплайны параллельно

```typescript
const [
  overallTotal,
  uniqueUsers,
  overallRecent,
  distribution,
  record,
  totalCocksCount,
  overallGrowthSpeed,
] = await Promise.all([
  cockDal.aggregate(pOverallTotal()),
  cockDal.aggregate(pUniqueUsers()),
  cockDal.aggregate(pOverallRecent()),
  cockDal.aggregate(pDistribution()),
  cockDal.aggregate(pRecord()),
  cockDal.aggregate(pTotalCocksCount()),
  cockDal.aggregate(pOverallGrowthSpeed()),
]);
```

### 2. Собрать ответ с дефолтами

Каждый пайплайн может вернуть пустой массив (если нет данных). Нужно обрабатывать:

```typescript
return {
  overall: {
    total_size: overallTotal[0]?.size ?? 0,
    unique_users: uniqueUsers[0]?.count ?? 0,
    recent: {
      average: overallRecent[0]?.average ?? 0,
      median: overallRecent[0]?.median ?? 0,
    },
    distribution: {
      huge_percent: distribution[0]?.huge ?? 0,
      little_percent: distribution[0]?.little ?? 0,
    },
    record: {
      requested_at: record[0]?.requested_at?.toISOString() ?? new Date().toISOString(),
      total: record[0]?.total ?? 0,
    },
    total_cocks_count: totalCocksCount[0]?.total_count ?? 0,
    growth_speed: overallGrowthSpeed[0]?.growth_speed ?? 0,
  },
};
```

## Алгоритм — Personal

### 1. Выполнить ВСЕ пайплайны параллельно (overall + individual)

```typescript
const [
  // Overall (те же 7)
  overallTotal, uniqueUsers, overallRecent, distribution, record, totalCocksCount, overallGrowthSpeed,
  // Individual (13)
  userTotal, userRecent, irk, userRecord, dominance, dailyGrowth,
  dailyDynamics, fiveCocksDynamics, userGrowthSpeed, userFirstCockDate,
  luck, volatility, userCocksCount,
] = await Promise.all([
  // Overall
  cockDal.aggregate(pOverallTotal()),
  cockDal.aggregate(pUniqueUsers()),
  cockDal.aggregate(pOverallRecent()),
  cockDal.aggregate(pDistribution()),
  cockDal.aggregate(pRecord()),
  cockDal.aggregate(pTotalCocksCount()),
  cockDal.aggregate(pOverallGrowthSpeed()),
  // Individual
  cockDal.aggregate(pUserTotal(userId)),
  cockDal.aggregate(pUserRecent(userId)),
  cockDal.aggregate(pIrk(userId)),
  cockDal.aggregate(pUserRecord(userId)),
  cockDal.aggregate(pDominance(userId)),
  cockDal.aggregate(pDailyGrowth(userId)),
  cockDal.aggregate(pDailyDynamics(userId)),
  cockDal.aggregate(pFiveCocksDynamics(userId)),
  cockDal.aggregate(pUserGrowthSpeed(userId)),
  cockDal.aggregate(pUserFirstCockDate(userId)),
  cockDal.aggregate(pLuck(userId)),
  cockDal.aggregate(pVolatility(userId)),
  cockDal.aggregate(pUserCocksCount(userId)),
]);
```

### 2. Собрать ответ

Все значения с дефолтами (0, пустая дата):

```typescript
return {
  overall: { /* ... как в Global ... */ },
  individual: {
    total_size: userTotal[0]?.total ?? 0,
    recent_average: userRecent[0]?.average ?? 0,
    irk: irk[0]?.irk ?? 0,
    record: {
      requested_at: userRecord[0]?.requested_at?.toISOString() ?? new Date().toISOString(),
      total: userRecord[0]?.total ?? 0,
    },
    dominance: dominance[0]?.dominance ?? 0,
    daily_growth_average: dailyGrowth[0]?.average ?? 0,
    daily_dynamics: {
      yesterday_cock_change: dailyDynamics[0]?.yesterday_cock_change ?? 0,
      yesterday_cock_change_percent: dailyDynamics[0]?.yesterday_cock_change_percent ?? 0,
    },
    five_cocks_dynamics: {
      five_cocks_change: fiveCocksDynamics[0]?.five_cocks_change ?? 0,
      five_cocks_change_percent: fiveCocksDynamics[0]?.five_cocks_change_percent ?? 0,
    },
    growth_speed: userGrowthSpeed[0]?.growth_speed ?? 0,
    first_cock_date: userFirstCockDate[0]?.first_date?.toISOString() ?? new Date().toISOString(),
    luck_coefficient: luck[0]?.luck_coefficient ?? 1.0,
    volatility: volatility[0]?.volatility ?? 0,
    cocks_count: userCocksCount[0]?.user_count ?? 0,
  },
};
```

## Описание метрик

### ИРК (Индекс Рандомного Кока)
- Формула: `log10(1 + user_total) / log10(1 + global_total)`
- Диапазон: 0.0 — 1.0+
- Показывает долю вклада юзера в общий "фонд"

### Доминирование
- Формула: `(user_total_size / global_total_size) * 100`
- В процентах

### Коэффициент везения
- Формула: `avg(last 5 cocks) / 30.5`
- 30.5 = мат.ожидание (0+60)/2 = 30, используется 30.5
- > 1.0 = везёт, < 1.0 = не везёт

### Волатильность
- Стандартное отклонение последних 5 коков
- sqrt(avg((size - avg_size)^2))

### Скорость роста
- Средний суммарный размер за день (последние 5 дней)
- Для юзера: последний кок каждого дня → среднее
- Для общей: сумма всех коков за день → среднее по дням

## Корнер-кейсы

1. **У юзера нет коков** — все individual поля = 0 / дефолт. Go-бот проверяет `len(result.IndividualCockTotal) == 0` и показывает "нет данных". На сервере — просто возвращаем нули.
2. **Менее 5 коков у юзера** — пайплайны recent/luck/volatility вернут данные по тем что есть (1-4 кока).
3. **Менее 2 коков** — daily_dynamics будет 0 (нет предыдущего для сравнения).
4. **Глобально нет данных** — overall всё = 0.
5. **luck_coefficient дефолт = 1.0** (нейтральный), не 0.

## Структура файлов

```
src/features/dynamics/
├── api/handler.ts             # уже есть (два хэндлера)
├── get-global.action.ts       # ← реализовать
├── get-personal.action.ts     # ← реализовать
├── db/pipelines.ts            # уже есть (все пайплайны)
├── types.ts                   # уже есть
└── index.ts                   # уже есть
```
