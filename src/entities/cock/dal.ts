import type { PipelineStage } from "mongoose";
import { getCockModel } from "./model";
import type { CockDoc } from "./types";

export const createCockDal = () => {
  const model = getCockModel();

  return {
    create: (data: CockDoc) => model.create(data),

    findByUserId: (userId: number) => model.find({ user_id: userId }).sort({ requested_at: -1 }).lean<CockDoc[]>().exec(),

    findLatestByUserId: (userId: number) => model.findOne({ user_id: userId }).sort({ requested_at: -1 }).lean<CockDoc>().exec(),

    aggregate: <T>(pipeline: PipelineStage[]) => model.aggregate<T>(pipeline).exec(),

    count: () => model.countDocuments().exec(),

    syncIndexes: () => model.syncIndexes(),
  };
};

export type CockDal = ReturnType<typeof createCockDal>;
