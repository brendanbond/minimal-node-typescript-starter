import { globalCache } from '../integrations/redis';

export const getAllCustomerEntryIds = () => {
  return new Promise<number[]>((resolve, reject) => {
    globalCache.smembers('customers', (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.map((val) => Number(val)));
      }
    });
  });
};
