import type { PipelineStage } from "mongoose";
import { getCockModel } from "./model";
import type { CockDoc } from "./types";

export const createCockDal = () => {
  const model = getCockModel();

  return {
    /** Создаёт документ кока в коллекции. */
    create: (data: CockDoc) => model.create(data),

    /** Выполняет агрегацию и возвращает результат. */
    aggregate: <T>(pipeline: PipelineStage[]) => model.aggregate<T>(pipeline).exec(),

    /** Дата первого кока пользователя (или null). */
    findFirstCockDate: async (userId: number): Promise<Date | null> => {
      const doc = await model.findOne({ user_id: userId }).sort({ requested_at: 1 }).select({ requested_at: 1 }).lean().exec();
      return doc?.requested_at ?? null;
    },

    /** Синхронизирует индексы модели с MongoDB. */
    syncIndexes: () => model.syncIndexes(),
  };
};

export type CockDal = ReturnType<typeof createCockDal>;
