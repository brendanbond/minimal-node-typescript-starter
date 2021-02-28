import { OrderEntry, CustomerEntry, TransactionEntry } from '../types';
import { convertAmountStringToInteger } from '../utils';
import { writeOrderEntry } from './writeOrderEntry';
import { getCustomerEntry } from './getCustomerEntry';
import { writeCustomerEntry } from './writeCustomerEntry';

export const processExistingOrderTransaction = async (
  orderEntry: OrderEntry,
  transactionEntry: TransactionEntry
) => {
  const { amount } = transactionEntry;
  const orderId = orderEntry.id;
  const netOrderPoints =
    orderEntry.netPoints + convertAmountStringToInteger(amount);
  const updatedOrderEntry: OrderEntry = {
    ...orderEntry,
    netPoints: netOrderPoints,
  };
  await writeOrderEntry(orderId, updatedOrderEntry);

  const customerEntry = await getCustomerEntry(updatedOrderEntry.customerId);
  if (!customerEntry) {
    throw new Error(
      `Processing transaction for cached order ${orderId} but can't find customer ${updatedOrderEntry.customerId}`
    );
  }
  const orderIndex = customerEntry.unVestedOrderIds.findIndex(
    (unVestedOrderId) => unVestedOrderId === orderEntry.id
  );
  if (orderIndex === -1) {
    console.log(
      `Processed a new transaction for an cached order ${orderId} that wasn't in the customer's unVestedOrderIds array, so we're assuming it has already vested`
    );
    return;
  }

  let updatedCustomerEntry: CustomerEntry;
  // if it is a full refund, take the order off the board for vesting
  if (netOrderPoints <= 0) {
    updatedCustomerEntry = {
      ...customerEntry,
      unVestedPoints:
        customerEntry.unVestedPoints + convertAmountStringToInteger(amount),
      unVestedOrderIds: [
        ...customerEntry.unVestedOrderIds.slice(0, orderIndex),
        ...customerEntry.unVestedOrderIds.slice(orderIndex + 1),
      ],
      transactionIds: [...customerEntry.transactionIds, transactionEntry.id],
    };
  } else {
    updatedCustomerEntry = {
      ...customerEntry,
      unVestedPoints:
        customerEntry.unVestedPoints + convertAmountStringToInteger(amount),
      transactionIds: [...customerEntry.transactionIds, transactionEntry.id],
    };
  }
  await writeCustomerEntry(customerEntry.id, updatedCustomerEntry);
};
