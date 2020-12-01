import { Response } from 'express';

import { getCustomerEntry, writeCustomerEntry } from '../interactors';
import { EventType, Customer } from '../types';
import {IRefundOrderWebhookRequest} from './types';

export const handleRefundOrderWebhookRequest = async (
  req: IRefundOrderWebhookRequest,
  res: Response
) => {
  const {
    body: {
      id: orderId,
      order_number: orderNumber,
      refund_line_items: refundLineItems,
      updated_at: updatedAt,
      customer: { id: customerId },
    },
  } = req;

  if (!orderNumber || refundLineItems.length !== 0 || !updatedAt || !customerId) {
    res.sendStatus(500);
    throw new Error(
      'Received malformed POST request from Shopify order webhook'
    );
  }

  try {
    const customerEntry = await getCustomerEntry(customerId);
    const lessPoints = refundLineItems.reduce((acc, curr) => acc + (curr.quantity * curr.subtotal), 0);

    if (customerEntry) {
      const orderIndex = customerEntry.orders.findIndex(
        (order) => order.id === orderId
      );
      if (orderIndex === -1)
        throw new Error('Received refund webhook for order not in cache');
      const newOrdersArray = [
        ...customerEntry.orders.slice(0, orderIndex),
        {
          ...customerEntry.orders[orderIndex],
          events: [
            ...customerEntry.orders[orderIndex].events,
            { type: EventType.OrderCancelled, netPoints: -1 * lessPoints },
          ],
        },
        ...customerEntry.orders.slice(orderIndex, customerEntry.orders.length),
      ];
      const updatedCustomerEntry: Customer = {
        ...customerEntry,
        unVestedPoints: customerEntry.unVestedPoints - lessPoints,
        orders: newOrdersArray,
      };
      await writeCustomerEntry(customerId, updatedCustomerEntry);
    } else {
      throw new Error('Received refund webhook for customer not in cache');
    }
  } catch (error) {
    console.error('Error while handling refund order webhook request:', error);
  }
};

/* SHAPE OF PARTIAL REFUND REQ BODY SHOPIFY v2020-10:
{
  id: 687260696736,
  order_id: 2924750176416,
  created_at: '2020-12-01T10:46:16-05:00',
  note: 'partial refund test',
  user_id: 67746103456,
  processed_at: '2020-12-01T10:46:16-05:00',
  restock: true,
  duties: [],
  total_duties_set: {
    shop_money: { amount: '0.00', currency_code: 'USD' },
    presentment_money: { amount: '0.00', currency_code: 'USD' }
  },
  admin_graphql_api_id: 'gid://shopify/Refund/687260696736',
  refund_line_items: [
    {
      id: 199475822752,
      quantity: 1,
      line_item_id: 6357591228576,
      location_id: 58113032352,
      restock_type: 'cancel',
      subtotal: 24,
      total_tax: 1.98,
      subtotal_set: [Object],
      total_tax_set: [Object],
      line_item: [Object]
    }
  ],
  transactions: [
    {
      id: 3602707906720,
      order_id: 2924750176416,
      kind: 'refund',
      gateway: 'bogus',
      status: 'success',
      message: 'Bogus Gateway: Forced success',
      created_at: '2020-12-01T10:46:15-05:00',
      test: true,
      authorization: null,
      location_id: null,
      user_id: 67746103456,
      parent_id: 3602701222048,
      processed_at: '2020-12-01T10:46:15-05:00',
      device_id: null,
      receipt: [Object],
      error_code: null,
      source_name: '1830279',
      amount: '25.98',
      currency: 'USD',
      admin_graphql_api_id: 'gid://shopify/OrderTransaction/3602707906720'
    }
  ],
  order_adjustments: []
}
*/
