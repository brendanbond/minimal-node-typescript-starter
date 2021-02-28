import { OrderEntry, CustomerEntry, TransactionEntry } from '../types';
import { convertAmountStringToInteger } from '../utils';
import { writeOrderEntry } from './writeOrderEntry';
import { getCustomerEntry } from './getCustomerEntry';
import { writeCustomerEntry } from './writeCustomerEntry';
import { fetchOrder } from '../integrations/shopify/orders';

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
};
