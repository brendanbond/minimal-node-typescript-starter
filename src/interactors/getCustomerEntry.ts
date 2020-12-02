import { globalCache } from '../integrations/redis';
import { Customer } from '../types';

export const getCustomerEntry = (id: number): Promise<Customer | null> => {
  return new Promise((resolve, reject) => {
    globalCache.get(`customer:${id}`, (err, cache) => {
      if (err) reject(err);

      if (cache) {
        resolve(JSON.parse(cache));
      } else resolve(null);
    });
  });
};
