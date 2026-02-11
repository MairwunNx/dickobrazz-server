/** Респект за место в сезоне (порт из Go-бота). */
export const calcSeasonRespect = (place: number): number => {
  if (place <= 0) return 0;

  const score = Math.floor(1337 / place ** 1.2);
  return score < 1 ? 1 : score;
};
