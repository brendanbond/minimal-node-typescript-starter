import { globalCache } from '../integrations/redis';
import { Order } from '../types';

export const getOrderEntry = (id: number): Promise<Order | null> => {
  return new Promise((resolve, reject) => {
    globalCache.get(`order:${id}`, (err, cache) => {
      if (err) reject(err);

      if (cache) {
        resolve(JSON.parse(cache));
      } else resolve(null);
    });
  });
};
