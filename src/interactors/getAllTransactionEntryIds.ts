import { globalCache } from '../integrations/redis';

export const getAllTransactionEntryIds = () => {
  return new Promise<number[]>((resolve, reject) => {
    globalCache.smembers('transactions', (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.map((val) => Number(val)));
      }
    });
  });
};
