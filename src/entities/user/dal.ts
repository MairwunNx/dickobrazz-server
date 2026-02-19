import { getUserModel } from "./model";
import type { UserDoc, UserProfile } from "./types";

export const createUserDal = () => {
  const model = getUserModel();

  return {
    /** Возвращает пользователя по user_id или null. */
    findByUserId: (userId: number) => model.findOne({ user_id: userId }).lean<UserDoc>().exec(),

    /** Возвращает массив пользователей по списку user_id. */
    findByUserIds: (userIds: number[]) =>
      model
        .find({ user_id: { $in: userIds } })
        .lean<UserDoc[]>()
        .exec(),

    /** Обновляет флаг is_hidden пользователя. */
    updatePrivacy: (userId: number, isHidden: boolean) =>
      model.findOneAndUpdate({ user_id: userId }, { $set: { is_hidden: isHidden, updated_at: new Date() } }, { new: true, lean: true }).exec(),

    /** Создаёт пользователя если нет, иначе обновляет username и is_hidden. */
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
            $setOnInsert: { user_id: profile.id, created_at: new Date() },
          },
          { upsert: true, new: true, lean: true }
        )
        .exec();
      return result as UserDoc;
    },

    /** Создаёт пользователя если нет, иначе обновляет username. */
    sync: (userId: number, username?: string) =>
      model
        .findOneAndUpdate(
          { user_id: userId },
          {
            $set: { ...(username !== undefined && { username }), updated_at: new Date() },
            $setOnInsert: { user_id: userId, is_hidden: false, created_at: new Date() },
          },
          { upsert: true, new: true, lean: true }
        )
        .exec(),

    /** Заполняет username для пользователей, у которых он пустой. Не перезаписывает существующий. */
    backfillUsernames: (entries: { userId: number; username: string }[]) =>
      model.bulkWrite(
        entries.map((e) => ({
          updateOne: {
            filter: { user_id: e.userId, $or: [{ username: { $exists: false } }, { username: null }, { username: "" }] },
            update: { $set: { username: e.username, updated_at: new Date() } },
          },
        }))
      ),

    /** Общее количество пользователей в коллекции. */
    count: () => model.countDocuments().exec(),

    /** Синхронизирует индексы модели с MongoDB. */
    syncIndexes: () => model.syncIndexes(),
  };
};

export type UserDal = ReturnType<typeof createUserDal>;
