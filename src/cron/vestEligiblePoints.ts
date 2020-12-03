import dayjs from 'dayjs';

import {
  deleteOrderEntry,
  getAllOrderEntryIds,
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
} from '../interactors';
import { Customer, Order } from '../types';
import { asyncForEach } from '../utils';
import { constants } from '../data';

export const vestEligiblePoints = async () => {
  const today = dayjs();
  const orderIds = await getAllOrderEntryIds();
  console.log('Vesting eligible points...');

  await asyncForEach<number>(orderIds, async (orderId) => {
    const orderEntry = await getOrderEntry(orderId);
    if (!orderEntry) {
      throw new Error(
        'Order ID contained in customers set not found in key/value store'
      );
    }
    const customerEntry = await getCustomerEntry(orderEntry?.customerId);
    if (!customerEntry) {
      throw new Error(
        'Customer ID contained in order entry does not resolve to customer entry in key/value store'
      );
    }

    const createdAt = dayjs(orderEntry.dateTimeCreated);
    const vestingDate = createdAt.add(
      constants.vestTimeAmount,
      constants.vestTimeUnit
    );

    if (today.isAfter(vestingDate)) {
      const orderIndex = customerEntry.unVestedOrderIds.findIndex(
        (unVestedOrderId) => unVestedOrderId === orderId
      );
      const vestedPoints = orderEntry.netPoints;
      const newCustomerEntry: Customer = {
        ...customerEntry,
        unVestedPoints: customerEntry.unVestedPoints - vestedPoints,
        vestedPoints: customerEntry.vestedPoints + vestedPoints,
        unVestedOrderIds: [
          ...customerEntry.unVestedOrderIds.slice(0, orderIndex),
          ...customerEntry.unVestedOrderIds.slice(orderIndex + 1),
        ],
      };
      await deleteOrderEntry(orderId);
      await writeCustomerEntry(orderEntry.customerId, newCustomerEntry);
    } else {
      return;
    }
  });
};
