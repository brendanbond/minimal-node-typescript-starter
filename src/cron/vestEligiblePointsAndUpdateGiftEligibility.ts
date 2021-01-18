import dayjs from 'dayjs';

import {
  deleteOrderEntry,
  getAllOrderEntryIds,
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
} from '../interactors';
import { CustomerEntry } from '../types';
import { asyncForEach } from '../utils';
import { constants } from '../data';

export const vestEligiblePoints = async () => {
  const orderIds = await getAllOrderEntryIds();
  const today = dayjs();

  console.log('Vesting eligible points...');
  await asyncForEach<number>(orderIds, async (orderId) => {
    const orderEntry = await getOrderEntry(orderId);
    if (!orderEntry) {
      throw new Error(
        'Order ID contained in customers set not found in key/value store'
      );
    }
    const customerId = orderEntry.customerId;
    const customerEntry = await getCustomerEntry(customerId);
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
        (unVestedOrderId) => unVestedOrderId === orderEntry.id
      );
      const vestedPoints = orderEntry.netPoints;
      const newCustomerEntry: CustomerEntry = {
        ...customerEntry,
        unVestedPoints: customerEntry.unVestedPoints - vestedPoints,
        vestedPoints: customerEntry.vestedPoints + vestedPoints,
        unVestedOrderIds: [
          ...customerEntry.unVestedOrderIds.slice(0, orderIndex),
          ...customerEntry.unVestedOrderIds.slice(orderIndex + 1),
        ],
      };
      writeCustomerEntry(orderEntry.customerId, newCustomerEntry);
      deleteOrderEntry(orderEntry.id);
    }
  });
};
