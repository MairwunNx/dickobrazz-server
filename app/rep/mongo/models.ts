import mongoose, { type Model } from "mongoose";

export interface CockDoc {
  _id: string;
  size: number;
  nickname: string;
  user_id: number;
  requested_at: Date;
}

export interface UserDoc {
  user_id: number;
  username?: string;
  is_hidden: boolean;
  updated_at: Date;
}

export interface AchievementDoc {
  user_id: number;
  achievement_id: string;
  completed: boolean;
  completed_at?: Date;
  progress: number;
  last_checked_at: Date;
}

const cockSchema = new mongoose.Schema<CockDoc>(
  {
    _id: { type: String, required: true },
    size: { type: Number, required: true },
    nickname: { type: String, required: true },
    user_id: { type: Number, required: true },
    requested_at: { type: Date, required: true },
  },
  { collection: "cocks", versionKey: false }
);

cockSchema.index({ user_id: 1, requested_at: 1 });
cockSchema.index({ size: -1 });
cockSchema.index({ requested_at: 1 });

const userSchema = new mongoose.Schema<UserDoc>(
  {
    user_id: { type: Number, required: true },
    username: { type: String },
    is_hidden: { type: Boolean, required: true },
    updated_at: { type: Date, required: true },
  },
  { collection: "users", versionKey: false }
);

userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ username: 1 });
userSchema.index({ updated_at: 1 });

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

export const getCockModel = (): Model<CockDoc> => getModel("Cock", cockSchema);
export const getUserModel = (): Model<UserDoc> => getModel("User", userSchema);
export const getAchievementModel = (): Model<AchievementDoc> => getModel("Achievement", achievementSchema);
