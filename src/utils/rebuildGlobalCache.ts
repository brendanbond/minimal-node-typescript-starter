import dayjs, { Dayjs } from 'dayjs';

import { getOrdersSinceDate } from '../integrations/shopify';
import {
  EventType,
  GlobalCacheState,
  IShopifyOrdersQueryResponseItem,
} from '../types';
import { getCustomerEntry, writeCustomerEntry } from '../interactors';
import { Customer } from '../types';
import { asyncForEach } from './asyncForEach';

const calculatePointsFromOrder = ({
  created_at: createdAt,
  subtotal_price: subtotal,
  refunds,
}: IShopifyOrdersQueryResponseItem) => {
  return Math.floor(
    Number(subtotal) -
      refunds.reduce(
        (acc, curr) =>
          acc +
          curr.refund_line_items.reduce(
            (acc, curr) => acc + curr.quantity * curr.subtotal,
            0
          ),
        0
      )
  );
};

export const rebuildGlobalCacheFromDate = async (date: Dayjs) => {
  const formattedDate = date.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
  const orders = await getOrdersSinceDate(formattedDate);

  await asyncForEach<IShopifyOrdersQueryResponseItem>(orders, async (order) => {
    const {
      id: orderId,
      customer: { id: customerId },
      created_at: createdAt,
    } = order;

    try {
      const createdDate = dayjs(createdAt);
      const vestingDate = createdDate.add(30, 'day');
      const today = dayjs();

      let vested = 0;
      let unVested = 0;

      if (today.isBefore(vestingDate)) {
        unVested = calculatePointsFromOrder(order);
      } else if (today.isAfter(vestingDate)) {
        vested = calculatePointsFromOrder(order);
      }
      const customerEntry = await getCustomerEntry(customerId);

      if (customerEntry) {
        const updatedCustomerEntry: Customer = {
          ...customerEntry,
          unVestedPoints: customerEntry.unVestedPoints + unVested,
          vestedPoints: customerEntry.vestedPoints + vested,
          orders: [
            ...customerEntry.orders,
            {
              id: orderId,
              dateTimeCreated: createdAt,
              events: [
                { type: EventType.CacheRebuild, netPoints: vested + unVested },
              ],
            },
          ],
        };
        await writeCustomerEntry(customerId, updatedCustomerEntry);
      } else {
        const newCustomerEntry: Customer = {
          unVestedPoints: unVested,
          vestedPoints: vested,
          redeemed: [],
          orders: [
            {
              id: orderId,
              dateTimeCreated: createdAt,
              events: [
                { type: EventType.CacheRebuild, netPoints: unVested + vested },
              ],
            },
          ],
        };
        await writeCustomerEntry(customerId, newCustomerEntry);
      }
    } catch (error) {
      console.error('Error while updating global cache state:', error);
    }
  });
};
