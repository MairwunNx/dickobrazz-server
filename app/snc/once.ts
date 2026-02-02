type OnceOptions = {
  cacheError?: boolean;
  cachePromise?: boolean;
};

type OnceFn<F extends (...args: unknown[]) => unknown> = ((
  ...args: Parameters<F>
) => ReturnType<F>) & {
  reset: () => void;
  called: () => boolean;
};

const isPromise = <T>(value: T | Promise<T>): value is Promise<T> =>
  typeof (value as { then?: unknown })?.then === "function";

const once = <F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: OnceOptions = {},
): OnceFn<F> => {
  let called = false;
  let value = undefined as ReturnType<F>;
  let error: unknown;

  const wrapped = (...args: Parameters<F>): ReturnType<F> => {
    if (called) {
      if (error) throw error;
      return value;
    }

    try {
      const result = fn(...args);

      value = result as ReturnType<F>;
      called = true;

      if (options.cachePromise && isPromise(result)) {
        void result.catch((err) => {
          if (options.cacheError) {
            error = err;
            return;
          }
          called = false;
          value = undefined as ReturnType<F>;
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
      value = undefined as ReturnType<F>;
      error = undefined;
    },
    called() {
      return called;
    },
  });
};

export { once, type OnceFn, type OnceOptions };
