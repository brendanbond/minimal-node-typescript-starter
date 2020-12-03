import dayjs from 'dayjs';

import {
  getAllCustomerEntryIds,
  getCustomerEntry,
  writeCustomerEntry,
} from '../interactors';
import { Customer } from '../types';
import { asyncForEach } from '../utils';
import { constants } from '../data';

export const vestEligiblePoints = async () => {
  const today = dayjs();
  const customerIds = await getAllCustomerEntryIds();
  console.log('Vesting eligible points...');

  await asyncForEach<number>(customerIds, async (customerId) => {
    console.log(`Checking for vested points for customer:${customerId}`);
    const customerEntry = await getCustomerEntry(customerId);
    console.log(customerEntry);

    if (!customerEntry)
      throw new Error(
        'Customer ID contained in customers set not found in key/value store'
      );

    const newCustomerEntry = customerEntry.orders.reduce((acc, curr, index) => {
      if (curr.vested) return acc;

      let vestedPoints = 0;
      const createdAt = dayjs(curr.dateTimeCreated);
      if (
        today.isBefore(
          createdAt.add(constants.vestTimeAmount, constants.vestTimeUnit)
        )
      ) {
        return acc;
      } else {
        vestedPoints = curr.events.reduce(
          (acc, curr) => acc + curr.netPoints,
          0
        );
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
    }, customerEntry);

    await writeCustomerEntry(customerId, newCustomerEntry);
  });
};
