type OnceOptions = {
  cacheError?: boolean;
  cachePromise?: boolean;
};

type OnceFn<A extends unknown[], R> = ((...args: A) => R) & {
  reset: () => void;
  called: () => boolean;
};

const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => typeof (value as { then?: unknown })?.then === "function";

export const once = <A extends unknown[], R>(fn: (...args: A) => R, options: OnceOptions = {}): OnceFn<A, R> => {
  let called = false;
  let value = undefined as R;
  let error: unknown;

  const wrapped = (...args: A): R => {
    if (called) {
      if (error) throw error;
      return value;
    }

    try {
      const result = fn(...args);
      value = result as R;
      called = true;

      if (options.cachePromise && isPromise(result)) {
        void result.catch((err) => {
          if (options.cacheError) {
            error = err;
            return;
          }
          called = false;
          value = undefined as R;
        });
      }

      return value;
    } catch (err) {
      if (options.cacheError) {
        error = err;
        called = true;
      }
      throw err;
    }
  };

  return Object.assign(wrapped, {
    reset() {
      called = false;
      value = undefined as R;
      error = undefined;
    },
    called() {
      return called;
    },
  });
};

export type { OnceFn, OnceOptions };
