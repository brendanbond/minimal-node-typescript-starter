export const sleep = (timeInMs: number) => {
  console.log('Sleeping...');
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
};
