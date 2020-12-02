import { globalCache } from '../integrations/redis';
import { Customer } from '../types';

export const writeCustomerEntry = (id: number, entry: Customer) => {
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
