import type { RedisClient } from "bun";
import type { Db } from "mongodb";
import { createInjector } from "typed-inject";
import { createAchievementDal } from "@/entities/achievement";
import { createCockDal } from "@/entities/cock";
import { createUserDal } from "@/entities/user";
import { createAchievementsHandler, createGetAchievementsAction } from "@/features/achievements";
import { createAuthHandler, createLoginAction, createValidateAction } from "@/features/auth";
import { createGenerateSizeAction, createSizeHandler } from "@/features/cock-size";
import { createDynamicGlobalHandler, createDynamicPersonalHandler, createGetDynamicGlobalAction, createGetDynamicPersonalAction } from "@/features/dynamics";
import { createCheckAction, createHealthHandler } from "@/features/health";
import { createGetLadderAction, createLadderHandler } from "@/features/ladder";
import { createExportMetricsAction, createMetricsHandler } from "@/features/metrics";
import { createGetProfileAction, createMeHandler, createPrivacyHandler, createUpdatePrivacyAction } from "@/features/profile";
import { createGetRaceAction, createRaceHandler } from "@/features/race";
import { createGetRulerAction, createRulerHandler } from "@/features/ruler";
import { createGetSeasonsAction, createSeasonsHandler } from "@/features/seasons";
import type { AppConfig } from "@/shared/config/schema";
import { di } from "@/shared/injection";
import { random } from "@/shared/lib/random";

export const createContainer = (config: AppConfig, botToken: string, mongo: Db, redis: RedisClient) =>
  createInjector()
    // Shared
    .provideValue(di.config, config)
    .provideValue(di.botToken, botToken)
    .provideValue(di.mongo, mongo)
    .provideValue(di.redis, redis)
    .provideFactory(di.random, random)
    // Entities
    .provideFactory(di.userDal, createUserDal)
    .provideFactory(di.cockDal, createCockDal)
    .provideFactory(di.achievementDal, createAchievementDal)
    // Actions
    .provideFactory(di.loginAction, createLoginAction)
    .provideFactory(di.validateAction, createValidateAction)
    .provideFactory(di.checkAction, createCheckAction)
    .provideFactory(di.exportMetricsAction, createExportMetricsAction)
    .provideFactory(di.getProfileAction, createGetProfileAction)
    .provideFactory(di.updatePrivacyAction, createUpdatePrivacyAction)
    .provideFactory(di.generateSizeAction, createGenerateSizeAction)
    .provideFactory(di.getRulerAction, createGetRulerAction)
    .provideFactory(di.getRaceAction, createGetRaceAction)
    .provideFactory(di.getDynamicGlobalAction, createGetDynamicGlobalAction)
    .provideFactory(di.getDynamicPersonalAction, createGetDynamicPersonalAction)
    .provideFactory(di.getAchievementsAction, createGetAchievementsAction)
    .provideFactory(di.getLadderAction, createGetLadderAction)
    .provideFactory(di.getSeasonsAction, createGetSeasonsAction)
    // Handlers
    .provideFactory(di.authHandler, createAuthHandler)
    .provideFactory(di.healthHandler, createHealthHandler)
    .provideFactory(di.metricsHandler, createMetricsHandler)
    .provideFactory(di.meHandler, createMeHandler)
    .provideFactory(di.privacyHandler, createPrivacyHandler)
    .provideFactory(di.sizeHandler, createSizeHandler)
    .provideFactory(di.rulerHandler, createRulerHandler)
    .provideFactory(di.raceHandler, createRaceHandler)
    .provideFactory(di.dynamicGlobalHandler, createDynamicGlobalHandler)
    .provideFactory(di.dynamicPersonalHandler, createDynamicPersonalHandler)
    .provideFactory(di.achievementsHandler, createAchievementsHandler)
    .provideFactory(di.ladderHandler, createLadderHandler)
    .provideFactory(di.seasonsHandler, createSeasonsHandler);

export type Container = ReturnType<typeof createContainer>;
