export const createTicker = (): (() => number) => {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
};
