import { getAchievementModel } from "./model";
import type { AchievementDoc } from "./types";

export const createAchievementDal = () => {
  const model = getAchievementModel();

  return {
    /** Возвращает все достижения пользователя. */
    findByUserId: (userId: number) => model.find({ user_id: userId }).lean<AchievementDoc[]>().exec(),

    /** Создаёт или обновляет достижение пользователя по achievement_id. */
    upsert: (userId: number, achievementId: string, data: Partial<AchievementDoc>) =>
      model.findOneAndUpdate({ user_id: userId, achievement_id: achievementId }, { $set: data }, { upsert: true, new: true, lean: true }).exec(),

    /** Синхронизирует индексы модели с MongoDB. */
    syncIndexes: () => model.syncIndexes(),
  };
};

export type AchievementDal = ReturnType<typeof createAchievementDal>;
