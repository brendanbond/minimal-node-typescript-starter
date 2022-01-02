export const asyncForEach = async <T>(
  array: T[],
  fn: (element: T) => Promise<void>
) =>
  array.reduce(async (promise, curr) => {
    await promise;
    return fn(curr);
  }, Promise.resolve());
