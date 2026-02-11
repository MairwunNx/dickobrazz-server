import { getAchievementModel } from "./model";
import type { AchievementDoc } from "./types";

export const createAchievementDal = () => {
  const model = getAchievementModel();

  return {
    findByUserId: (userId: number) => model.find({ user_id: userId }).lean<AchievementDoc[]>().exec(),

    upsert: (userId: number, achievementId: string, data: Partial<AchievementDoc>) =>
      model.findOneAndUpdate({ user_id: userId, achievement_id: achievementId }, { $set: data }, { upsert: true, new: true, lean: true }).exec(),

    syncIndexes: () => model.syncIndexes(),
  };
};

export type AchievementDal = ReturnType<typeof createAchievementDal>;
