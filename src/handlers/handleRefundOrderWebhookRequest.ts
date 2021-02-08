import { Response } from 'express';

import {
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
  writeOrderEntry,
} from '../interactors';
import { CustomerEntry, OrderEntry } from '../types';
import { IRefundOrderWebhookRequest } from './types';

export const handleRefundOrderWebhookRequest = async (
  req: IRefundOrderWebhookRequest,
  res: Response
) => {
  const {
    body: { order_id: orderId, refund_line_items: refundLineItems },
  } = req;

  console.log('Received refund order webhook request:', req.body);

  try {
    const orderEntry = await getOrderEntry(orderId);

    if (orderEntry) {
      const customerId = orderEntry.customerId;
      const customerEntry = await getCustomerEntry(customerId);
      if (customerEntry) {
        const unVestedOrder = customerEntry.unVestedOrderIds.find(
          (unVestedOrderId) => unVestedOrderId === orderId
        );
        if (unVestedOrder) {
          const lessPoints = refundLineItems.reduce(
            (acc, lineItem) => acc + lineItem.quantity * lineItem.subtotal,
            0
          );
          const newCustomerEntry: CustomerEntry = {
            ...customerEntry,
            unVestedPoints: customerEntry.unVestedPoints - lessPoints,
          };
          await writeCustomerEntry(customerId, newCustomerEntry);

          const updatedOrderEntry: OrderEntry = {
            ...orderEntry,
            netPoints: orderEntry.netPoints - lessPoints,
          };
          await writeOrderEntry(orderId, updatedOrderEntry);
        } else {
          throw new Error(
            `Order ${orderId} was refunded but the points have already vested or the order is not contained in unVestedOrderIds`
          );
        }
      } else {
        throw new Error(
          `We have order ${orderId} in the cache but not the associated customer ${customerId}`
        );
      }
    }
    res.sendStatus(200);
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
