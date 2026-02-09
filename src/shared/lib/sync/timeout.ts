export const withTimeout = <T>(promise: Promise<T>, ms: number, label = "Operation"): Promise<T> => {
  const signal = AbortSignal.timeout(ms);
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(new Error(`${label} timed out after ${ms}ms`)));
    }),
  ]);
};
