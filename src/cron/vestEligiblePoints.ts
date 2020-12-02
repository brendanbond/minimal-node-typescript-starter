import dayjs from 'dayjs';

import {
  getAllCustomerEntryIds,
  getCustomerEntry,
  writeCustomerEntry,
} from '../interactors';
import { Customer } from '../types';
import { asyncForEach } from '../utils';

export const vestEligiblePoints = async () => {
  const today = dayjs();
  const customerIds = await getAllCustomerEntryIds();

  await asyncForEach<number>(customerIds, async (customerId) => {
    const customerEntry = await getCustomerEntry(customerId);

    if (!customerEntry)
      throw new Error(
        'Customer ID contained in customers set not found in key/value store'
      );

    const newCustomerEntry = customerEntry.orders.reduce((acc, curr, index) => {
      if (curr.vested) return acc;

      let vestedPoints = 0;
      const createdAt = dayjs(curr.dateTimeCreated);
      if (today.isBefore(createdAt.add(30, 'day'))) {
        return acc;
      } else {
        vestedPoints = curr.events.reduce((acc, curr) => acc + curr.netPoints, 0);
      }
      return {
        ...acc,
        unVestedPoints: acc.unVestedPoints - vestedPoints,
        vestedPoints: acc.vestedPoints + vestedPoints,
        orders: [
          ...acc.orders.slice(0, index),
          {
            ...acc.orders[index],
            vested: true,
          },
          ...acc.orders.slice(index + 1),
        ],
      };
    }, {} as Customer);

    await writeCustomerEntry(customerId, newCustomerEntry);
  });
};
