import mongoose, { type Model } from "mongoose";
import type { UserDoc } from "./types";

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

const getModel = <T>(name: string, schema: mongoose.Schema<T>): Model<T> => {
  const existing = mongoose.models[name] as Model<T> | undefined;
  return existing ?? mongoose.model<T>(name, schema);
};

export const getUserModel = (): Model<UserDoc> => getModel("User", userSchema);
