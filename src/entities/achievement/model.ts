import mongoose, { type Model } from "mongoose";
import type { AchievementDoc } from "./types";

const achievementSchema = new mongoose.Schema<AchievementDoc>(
  {
    user_id: { type: Number, required: true },
    achievement_id: { type: String, required: true },
    completed: { type: Boolean, required: true },
    completed_at: { type: Date },
    progress: { type: Number, required: true },
    last_checked_at: { type: Date, required: true },
  },
  { collection: "achievements", versionKey: false }
);

achievementSchema.index({ user_id: 1, achievement_id: 1 }, { unique: true });
achievementSchema.index({ user_id: 1, completed: 1 });

const getModel = <T>(name: string, schema: mongoose.Schema<T>): Model<T> => {
  const existing = mongoose.models[name] as Model<T> | undefined;
  return existing ?? mongoose.model<T>(name, schema);
};

export const getAchievementModel = (): Model<AchievementDoc> => getModel("Achievement", achievementSchema);
