import { globalCache } from '../integrations/redis';
import { CustomerEntry } from '../types';

export const getCustomerEntry = (id: number): Promise<CustomerEntry | null> => {
  return new Promise((resolve, reject) => {
    globalCache.get(`customer:${id}`, (err, cache) => {
      if (err) reject(err);

      if (cache) {
        try {
          resolve(JSON.parse(cache));
        } catch (err) {
          reject(`Error while parsing JSON for customer id ${id}: ${err}`);
        }
      } else resolve(null);
    });
  });
};
