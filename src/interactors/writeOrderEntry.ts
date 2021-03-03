import { globalCache } from '../integrations/redis';
import { OrderEntry } from '../types';

export const writeOrderEntry = (id: number, entry: OrderEntry) =>
  new Promise((resolve, reject) => {
    const entryStr = JSON.stringify(entry);
    globalCache.set(`order:${id}`, entryStr, (err, res) => {
      if (err) {
        reject(err);
      } else {
        globalCache.sadd('orders', `${id}`, (err, res) => {
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
