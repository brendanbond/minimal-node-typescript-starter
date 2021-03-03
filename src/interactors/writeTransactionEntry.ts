import { globalCache } from '../integrations/redis';
import { TransactionEntry } from '../types';

export const writeTransactionEntry = (id: number, entry: TransactionEntry) =>
  new Promise((resolve, reject) => {
    const entryStr = JSON.stringify(entry);
    globalCache.set(`transaction:${id}`, entryStr, (err, res) => {
      if (err) {
        reject(err);
      } else {
        globalCache.sadd('transactions', `${id}`, (err, res) => {
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
