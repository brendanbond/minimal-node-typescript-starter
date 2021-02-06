import dayjs from 'dayjs';

import {
  getAllCustomerEntryIds,
  getAllOrderEntryIds,
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
} from '../interactors';
import { CustomerEntry } from '../types';
import { asyncForEach } from '../utils';
import { constants } from '../data';

export const vestEligiblePoints = async () => {
  const customerIds = await getAllCustomerEntryIds();
  const today = dayjs();

  console.log('Vesting eligible points...');
  await asyncForEach<number>(customerIds, async (customerId) => {
    const customerEntry = await getCustomerEntry(customerId);
    if (!customerEntry) {
      throw new Error(
        'Customer ID contained in customers set does not have corresponding customer entry'
      );
    }
    const unVestedOrderIds = customerEntry.unVestedOrderIds;
    await asyncForEach<number>(unVestedOrderIds, async (orderId) => {
      const orderEntry = await getOrderEntry(orderId);
      if (!orderEntry) {
        throw new Error(
          'Order ID contained in customer unvested order IDs does not have a corresponding order entry'
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
          vestedOrderIds: [...customerEntry.vestedOrderIds, orderEntry.id],
        };
        writeCustomerEntry(orderEntry.customerId, newCustomerEntry);
      }
    });
  });
};
