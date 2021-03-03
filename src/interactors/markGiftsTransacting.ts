import { CustomerEntry, GiftRedemptionStatus, GiftStatus } from '../types';
import { getCustomerEntry } from './getCustomerEntry';
import { writeCustomerEntry } from './writeCustomerEntry';

const constructNewGifts = (
  curGifts: CustomerEntry['gifts'],
  giftLevelIds: number[],
  priceRuleId: number
) => {
  const newGifts = curGifts.slice();
  giftLevelIds.forEach((id) => {
    const idx = newGifts.findIndex(
      ({ giftLevelId }) => Number(giftLevelId) === id
    );
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

export const markGiftsTransacting = async (
  customerId: number,
  giftLevelIds: number[],
  priceRuleId: number
) => {
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
  await writeCustomerEntry(customerId, newEntry);
};
