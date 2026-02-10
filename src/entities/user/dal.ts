import { getUserModel } from "./model";
import type { UserDoc, UserProfile } from "./types";

export const createUserDal = () => {
  const model = getUserModel();

  return {
    findByUserId: (userId: number) => model.findOne({ user_id: userId }).lean<UserDoc>().exec(),

    create: (data: Omit<UserDoc, "updated_at">) => model.create({ ...data, updated_at: new Date() }),

    upsert: (userId: number, data: Partial<UserDoc>) =>
      model.findOneAndUpdate({ user_id: userId }, { $set: { ...data, updated_at: new Date() } }, { upsert: true, new: true, lean: true }).exec(),

    updatePrivacy: (userId: number, isHidden: boolean) =>
      model.findOneAndUpdate({ user_id: userId }, { $set: { is_hidden: isHidden, updated_at: new Date() } }, { new: true, lean: true }).exec(),

    getOrCreate: async (profile: UserProfile): Promise<UserDoc> => {
      const result = await model
        .findOneAndUpdate(
          { user_id: profile.id },
          {
            $set: {
              username: profile.username,
              is_hidden: profile.is_hidden,
              updated_at: new Date(),
            },
            $setOnInsert: { user_id: profile.id },
          },
          { upsert: true, new: true, lean: true }
        )
        .exec();
      return result as UserDoc;
    },

    sync: (userId: number, username?: string) =>
      model
        .findOneAndUpdate(
          { user_id: userId },
          {
            $set: { username, updated_at: new Date() },
            $setOnInsert: { user_id: userId, is_hidden: false },
          },
          { upsert: true, new: true, lean: true }
        )
        .exec(),

    count: () => model.countDocuments().exec(),

    syncIndexes: () => model.syncIndexes(),
  };
};

export type UserDal = ReturnType<typeof createUserDal>;
