import { globalCache } from '../integrations/redis';
import { CustomerEntry } from '../types';

export const writeCustomerEntry = (id: number, entry: CustomerEntry) => {
  return new Promise((resolve, reject) => {
    const entryStr = JSON.stringify(entry);
    globalCache.set(`customer:${id}`, entryStr, (err, res) => {
      if (err) {
        reject(err);
      } else {
        globalCache.sadd('customers', `${id}`, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
        resolve(res);
      }
    });
  });
};
