import { globalCache } from '../integrations/redis';
import { OrderEntry } from '../types';

export const getOrderEntry = (id: number): Promise<OrderEntry | null> => {
  return new Promise((resolve, reject) => {
    globalCache.get(`order:${id}`, (err, cache) => {
      if (err) reject(err);

      if (cache) {
        resolve(JSON.parse(cache));
      } else resolve(null);
    });
  });
};
