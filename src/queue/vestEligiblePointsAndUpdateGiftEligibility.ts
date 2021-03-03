import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as Sentry from '@sentry/node';

import {
  getAllCustomerEntryIds,
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
} from '../interactors';
import { CustomerEntry } from '../types';
import { asyncForEach } from '../utils';
import { constants } from '../data';

dayjs.extend(utc);

export const vestEligiblePoints = async () => {
  try {
    console.log('Vesting eligible points...');
    const customerIds = await getAllCustomerEntryIds();
    const today = dayjs();

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
        const vestingDate = createdAt
          .add(constants.vestTimeAmount, constants.vestTimeUnit)
          .utc();

        if (today.utc().isAfter(vestingDate)) {
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
          await writeCustomerEntry(orderEntry.customerId, newCustomerEntry);
        }
      });
    });
  } catch (error) {
    Sentry.captureException(error);
  }
};
