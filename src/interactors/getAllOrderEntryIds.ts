import { globalCache } from '../integrations/redis';

export const getAllOrderEntryIds = () =>
  new Promise<number[]>((resolve, reject) => {
    globalCache.smembers('orders', (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.map((val) => Number(val)));
      }
    });
  });
