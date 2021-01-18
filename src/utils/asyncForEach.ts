// export const asyncForEach = async <T>(
//   array: T[],
//   callback: (value: T, index: number, array: T[]) => void
// ) => {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// };

export const asyncForEach = async <T>(
  array: T[],
  fn: (element: T) => Promise<void>
) => {
  return array.reduce(async (promise, curr) => {
    await promise;
    return fn(curr);
  }, Promise.resolve());
};
