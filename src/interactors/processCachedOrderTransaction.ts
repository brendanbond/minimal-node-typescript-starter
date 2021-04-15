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
    // Order has (hopefully) vested, check in the vested order IDs; we're now going to refund points after vesting
    const vestedOrderIndex = customerEntry.vestedOrderIds.findIndex(
      (vestedOrderId) => vestedOrderId === orderEntry.id
    );
    if (vestedOrderIndex === -1)
      throw new Error(
        `Received a transaction for cached order ${orderEntry.id} but can't find it in unvested OR vested orders arrays`
      );
    let updatedCustomerEntry: CustomerEntry;
    // if it is a full refund, take the order out of the vested order array
    if (netOrderPoints <= 0) {
      updatedCustomerEntry = {
        ...customerEntry,
        vestedPoints:
          customerEntry.vestedPoints + convertAmountStringToInteger(amount),
        vestedOrderIds: [
          ...customerEntry.vestedOrderIds.slice(0, vestedOrderIndex),
          ...customerEntry.vestedOrderIds.slice(vestedOrderIndex + 1),
        ],
        transactionIds: [...customerEntry.transactionIds, transactionEntry.id],
      };
    } else {
      updatedCustomerEntry = {
        ...customerEntry,
        vestedPoints:
          customerEntry.vestedPoints + convertAmountStringToInteger(amount),
        transactionIds: [...customerEntry.transactionIds, transactionEntry.id],
      };
    }
    await writeCustomerEntry(customerEntry.id, updatedCustomerEntry);
  } else {
    // order hasn't vested, proceed as normal
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
  }
};
