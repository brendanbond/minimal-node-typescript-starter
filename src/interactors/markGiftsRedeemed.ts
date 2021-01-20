import { globalCache } from '../integrations/redis';
import { CustomerEntry } from '../types';
import { getCustomerEntry } from './getCustomerEntry';

export const markGiftsRedeemed = (customerId: number, giftLevels: number[]) => {
  return new Promise(async (resolve, reject) => {
    // const entryStr = JSON.stringify(entry);
    const customerEntry = await getCustomerEntry(customerId);
    if (!customerEntry) {
      throw new Error(
        `no customer found for customer Id ${customerId} while marking gifts redeemed`
      );
    }
    const newEntry: CustomerEntry = {
      ...customerEntry,
      redeemed: [...customerEntry.redeemed, ...giftLevels],
    };
    globalCache.set(
      `customer:${customerId}`,
      JSON.stringify(newEntry),
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          globalCache.sadd('customers', `${customerId}`, (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
          resolve(res);
        }
      }
    );
  });
};
