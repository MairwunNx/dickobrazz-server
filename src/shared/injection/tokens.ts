export const di = {
  // Shared
  config: "config",
  mongo: "mongo",
  redis: "redis",
  random: "random",
  botToken: "botToken",

  // Entities
  userDal: "userDal",
  cockDal: "cockDal",
  achievementDal: "achievementDal",

  // Feature Actions
  loginAction: "loginAction",
  validateAction: "validateAction",
  checkAction: "checkAction",
  exportMetricsAction: "exportMetricsAction",
  getProfileAction: "getProfileAction",
  updatePrivacyAction: "updatePrivacyAction",
  generateSizeAction: "generateSizeAction",
  getRulerAction: "getRulerAction",
  getRaceAction: "getRaceAction",
  getDynamicGlobalAction: "getDynamicGlobalAction",
  getDynamicPersonalAction: "getDynamicPersonalAction",
  getAchievementsAction: "getAchievementsAction",
  getLadderAction: "getLadderAction",
  getSeasonsAction: "getSeasonsAction",

  // Handlers
  authHandler: "authHandler",
  healthHandler: "healthHandler",
  metricsHandler: "metricsHandler",
  meHandler: "meHandler",
  privacyHandler: "privacyHandler",
  sizeHandler: "sizeHandler",
  rulerHandler: "rulerHandler",
  raceHandler: "raceHandler",
  dynamicGlobalHandler: "dynamicGlobalHandler",
  dynamicPersonalHandler: "dynamicPersonalHandler",
  achievementsHandler: "achievementsHandler",
  ladderHandler: "ladderHandler",
  seasonsHandler: "seasonsHandler",
} as const;
