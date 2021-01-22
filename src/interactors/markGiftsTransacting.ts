import { globalCache } from '../integrations/redis';
import { CustomerEntry, GiftRedemptionStatus, GiftStatus } from '../types';
import { getCustomerEntry } from './getCustomerEntry';

const constructNewGifts = (
  curGifts: CustomerEntry['gifts'],
  giftLevelIds: number[],
  priceRuleId: number
) => {
  let newGifts = curGifts.slice();
  giftLevelIds.forEach((id) => {
    const idx = newGifts.findIndex(({ giftLevelId }) => giftLevelId === id);
    let newGift: GiftStatus;
    if (idx === -1) {
      newGift = {
        giftLevelId: id,
        status: GiftRedemptionStatus.TRANSACTING,
        priceRuleId,
      };
    } else {
      newGift = {
        ...newGifts[idx],
        status: GiftRedemptionStatus.TRANSACTING,
        priceRuleId,
      };
    }
    newGifts.push(newGift);
  });
  return newGifts;
};

export const markGiftsTransacting = (
  customerId: number,
  giftLevelIds: number[],
  priceRuleId: number
) => {
  return new Promise(async (resolve, reject) => {
    // const entryStr = JSON.stringify(entry);
    const customerEntry = await getCustomerEntry(customerId);
    if (!customerEntry) {
      throw new Error(
        `no customer found for customer Id ${customerId} while marking gifts transacting`
      );
    }
    const newEntry: CustomerEntry = {
      ...customerEntry,
      gifts: constructNewGifts(customerEntry.gifts, giftLevelIds, priceRuleId),
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
