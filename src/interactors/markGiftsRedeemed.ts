import { globalCache } from '../integrations/redis';
import { CustomerEntry, GiftRedemptionStatus } from '../types';
import { getCustomerEntry } from './getCustomerEntry';

const constructNewGifts = (
  curGifts: CustomerEntry['gifts'],
  giftLevelIds: number[]
) => {
  let newGifts = curGifts.slice();
  giftLevelIds.forEach((id) => {
    const idx = newGifts.findIndex(
      ({ giftLevelId }) => Number(giftLevelId) === id
    );
    if (idx === -1) {
      throw new Error('thats weird, should exist');
    }
    newGifts[idx] = {
      ...newGifts[idx],
      status: GiftRedemptionStatus.REDEEMED,
    };
  });
  return newGifts;
};

export const markGiftsRedeemed = (
  customerId: number,
  giftLevelIds: number[]
) => {
  return new Promise(async (resolve, reject) => {
    // const entryStr = JSON.stringify(entry);
    console.log(`Marking gift redeemed for customer ${customerId}`);
    console.log('giftLevelIds', giftLevelIds);
    const customerEntry = await getCustomerEntry(customerId);
    if (!customerEntry) {
      throw new Error(
        `no customer found for customer Id ${customerId} while marking gifts redeemed`
      );
    }
    const newEntry: CustomerEntry = {
      ...customerEntry,
      gifts: constructNewGifts(customerEntry.gifts, giftLevelIds),
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
