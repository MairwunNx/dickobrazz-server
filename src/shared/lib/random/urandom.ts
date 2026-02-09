/*
  Ахтунг!

  Это не будет работать для отрицательных чисел!
  Реализация предназначена только для положительных чисел,
  так как только так мне и нужно.
*/
export const urandom = (min: number, max: number): number => {
  if (min >= max) throw new Error("Max must be greater than min");

  const range = max - min + 1;
  const byteCount = range <= 256 ? 1 : range <= 65536 ? 2 : 4;
  const array = new Uint8Array(byteCount);
  let randomNumber: number;

  do {
    crypto.getRandomValues(array);

    if (array.length === 1) {
      randomNumber = array[0] as number;
    } else if (array.length === 2) {
      randomNumber = (array[0] as number) | ((array[1] as number) << 8);
    } else {
      randomNumber = ((array[0] as number) | ((array[1] as number) << 8) | ((array[2] as number) << 16) | ((array[3] as number) << 24)) >>> 0;
    }
  } while (randomNumber >= range);

  return min + randomNumber;
};
