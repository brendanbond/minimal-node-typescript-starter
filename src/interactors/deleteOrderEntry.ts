import { globalCache } from '../integrations/redis';

export const deleteOrderEntry = async (id: number) => {
  return new Promise((resolve, reject) => {
    globalCache.del(`order:${id}`, (err, res) => {
      if (err) {
        reject(err);
      } else {
        globalCache.srem('orders', `${id}`, (err, res) => {
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
