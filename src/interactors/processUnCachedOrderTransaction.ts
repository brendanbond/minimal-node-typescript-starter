import { OrderEntry, CustomerEntry, TransactionEntry } from '../types';
import { convertAmountStringToInteger } from '../utils';
import { writeOrderEntry } from './writeOrderEntry';
import { getCustomerEntry } from './getCustomerEntry';
import { writeCustomerEntry } from './writeCustomerEntry';
import { markGiftsRedeemed } from './markGiftsRedeemed';
import { fetchOrder } from '../integrations/shopify/orders';
import { decodePriceRuleTitle } from '../utils/priceRuleTitle';

const discountCodeRedeemsGift = ({ code }: { code: string }) => {
  try {
    decodePriceRuleTitle(code);
  } catch (e) {
    return false;
  }
  return true;
};

export const processUnCachedOrderTransaction = async (
  transaction: TransactionEntry
) => {
  const { orderId, amount, id: transactionId } = transaction;
  const order = await fetchOrder(orderId);
  const newOrderEntry: OrderEntry = {
    id: order.id,
    customerId: order.customer.id,
    dateTimeCreated: order.created_at,
    netPoints: convertAmountStringToInteger(amount),
  };
  await writeOrderEntry(orderId, newOrderEntry);

  const customerId = order.customer.id;
  const customerEntry = await getCustomerEntry(customerId);
  if (customerEntry) {
    const updatedCustomerEntry: CustomerEntry = {
      ...customerEntry,
      unVestedOrderIds: [...customerEntry.unVestedOrderIds, orderId],
      unVestedPoints:
        customerEntry.unVestedPoints + convertAmountStringToInteger(amount),
      transactionIds: [...customerEntry.transactionIds, transactionId],
    };
    await writeCustomerEntry(customerId, updatedCustomerEntry);
  } else {
    const newCustomerEntry: CustomerEntry = {
      id: customerId,
      unVestedPoints: convertAmountStringToInteger(amount),
      vestedPoints: 0,
      gifts: [],
      unVestedOrderIds: [orderId],
      vestedOrderIds: [],
      transactionIds: [transactionId],
      currentPriceRuleId: null,
      vip: false,
      onApproval: false,
    };
    await writeCustomerEntry(customerId, newCustomerEntry);
  }
  
  const discountCodes = order.discount_codes;
  console.log('Here are all of the discountCodes:', discountCodes);
  await Promise.all(
    discountCodes.map(async (discountCode) => {
      console.log("Here's the discountCode", discountCode);
      if (discountCodeRedeemsGift(discountCode)) {
        console.log('discountCodeRedeemsGift is true');
        const giftLevelIdsToBeRedeemed = decodePriceRuleTitle(
          discountCode.code
        );
        await markGiftsRedeemed(customerId, giftLevelIdsToBeRedeemed);
      }
    })
  );
};
