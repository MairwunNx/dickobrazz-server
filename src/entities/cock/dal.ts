import type { PipelineStage } from "mongoose";
import { getCockModel } from "./model";
import type { CockDoc } from "./types";

export const createCockDal = () => {
  const model = getCockModel();

  return {
    create: (data: CockDoc) => model.create(data),

    aggregate: <T>(pipeline: PipelineStage[]) => model.aggregate<T>(pipeline).exec(),

    syncIndexes: () => model.syncIndexes(),
  };
};

export type CockDal = ReturnType<typeof createCockDal>;
