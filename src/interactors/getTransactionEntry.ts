import { globalCache } from '../integrations/redis';
import { TransactionEntry } from '../types';

export const getTransactionEntry = (id: number): Promise<TransactionEntry | null> => {
  return new Promise((resolve, reject) => {
    globalCache.get(`transaction:${id}`, (err, cache) => {
      if (err) reject(err);

      if (cache) {
        resolve(JSON.parse(cache));
      } else resolve(null);
    });
  });
};
