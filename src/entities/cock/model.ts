import mongoose, { type Model } from "mongoose";
import type { CockDoc } from "./types";

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
cockSchema.index({ user_id: 1, size: 1 }); // covered scan для ladder $group + $sum
cockSchema.index({ size: -1 });
cockSchema.index({ requested_at: 1 });

const getModel = <T>(name: string, schema: mongoose.Schema<T>): Model<T> => {
  const existing = mongoose.models[name] as Model<T> | undefined;
  return existing ?? mongoose.model<T>(name, schema);
};

export const getCockModel = (): Model<CockDoc> => getModel("Cock", cockSchema);
