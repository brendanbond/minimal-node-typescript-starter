import dayjs from 'dayjs';
import { Response } from 'express';

import { getCustomerEntry, writeCustomerEntry } from '../interactors';
import { Customer, EventType } from '../types';
import {INewOrderWebhookRequest} from './types'

export const handleNewOrderWebhookRequest = async (
  req: INewOrderWebhookRequest,
  res: Response
) => {
  const {
    body: {
      id: orderId,
      order_number: orderNumber,
      subtotal_price: subTotal,
      created_at: createdAt,
      customer: { id: customerId },
    },
  } = req;

  if (!orderNumber || !subTotal || !createdAt || !customerId) {
    res.sendStatus(500);
    throw new Error(
      'Received malformed POST request from Shopify order webhook'
    );
  }

  try {
    const customerEntry = await getCustomerEntry(customerId);
    const newPoints = Math.floor(Number(subTotal));

    if (customerEntry) {
      const updatedCustomerEntry: Customer = {
        ...customerEntry,
        unVestedPoints: customerEntry.unVestedPoints + newPoints,
        orders: [
          ...customerEntry.orders,
          {
            id: orderId,
            dateTimeCreated: createdAt,
            vested: false,
            events: [{ type: EventType.OrderPlaced, netPoints: newPoints }],
          },
        ],
      };
      await writeCustomerEntry(customerId, updatedCustomerEntry);
    } else {
      const newCustomerEntry: Customer = {
        unVestedPoints: newPoints,
        vestedPoints: 0,
        redeemed: [],
        orders: [
          {
            id: orderId,
            dateTimeCreated: createdAt,
            vested: false,
            events: [{ type: EventType.OrderPlaced, netPoints: newPoints }],
          },
        ],
      };
      await writeCustomerEntry(customerId, newCustomerEntry);
    }
  } catch (error) {
    console.error('Error while handling order webhook request:', error);
  }
};

/* SHAPE OF ORDER POST REQUEST FROM SHOPIFY API 2020-10:
{
  id: 2922898653344,
  email: 'brendanbond@gmail.com',
  closed_at: null,
  created_at: '2020-11-30T23:43:33-05:00',
  updated_at: '2020-11-30T23:43:34-05:00',
  number: 2,
  note: null,
  token: '535db496eb493a06b21e0aaa80fb921d',
  gateway: 'bogus',
  test: true,
  total_price: '31.29',
  subtotal_price: '24.00',
  total_weight: 181,
  total_tax: '2.39',
  taxes_included: false,
  currency: 'USD',
  financial_status: 'paid',
  confirmed: true,
  total_discounts: '0.00',
  total_line_items_price: '24.00',
  cart_token: '3bc9d7d8e2c13edde975f8aed315a89d',
  buyer_accepts_marketing: false,
  name: '#1002',
  referring_site: '',
  landing_site: '/admin/online-store/embedded-modal-host?hmac=9d8099e2796637a36285ca301065d385c0e1a39a28125e0b3cb8f52896635695&locale=en&new_design_language=true&session=80c477d867ae97d2287aff7e155ad1ff1a1486a269e0480074d90f8ec7010226&shop=youronetruebabe.myshopify.com&timestamp=1606752967&shopId=51809779872&newServerStack=true',
  cancelled_at: null,
  cancel_reason: null,
  total_price_usd: '31.29',
  checkout_token: '011901659db0bbf4ab06b7c1a920135c',
  reference: null,
  user_id: null,
  location_id: null,
  source_identifier: null,
  source_url: null,
  processed_at: '2020-11-30T23:43:31-05:00',
  device_id: null,
  phone: null,
  customer_locale: 'en',
  app_id: 580111,
  browser_ip: '67.198.97.185',
  landing_site_ref: null,
  order_number: 1002,
  discount_applications: [],
  discount_codes: [],
  note_attributes: [],
  payment_gateway_names: [ 'bogus' ],
  processing_method: 'direct',
  checkout_id: 16610628042912,
  source_name: 'web',
  fulfillment_status: null,
  tax_lines: [
    {
      price: '0.58',
      rate: 0.02,
      title: 'Austin City Tax',
      price_set: [Object]
    },
    {
      price: '1.81',
      rate: 0.0625,
      title: 'Texas State Tax',
      price_set: [Object]
    }
  ],
  tags: '',
  contact_email: 'brendanbond@gmail.com',
  order_status_url: 'https://youronetruebabe.myshopify.com/51809779872/orders/535db496eb493a06b21e0aaa80fb921d/authenticate?key=61a0730335679583150399a8836cb849',
  presentment_currency: 'USD',
  total_line_items_price_set: {
    shop_money: { amount: '24.00', currency_code: 'USD' },
    presentment_money: { amount: '24.00', currency_code: 'USD' }
  },
  total_discounts_set: {
    shop_money: { amount: '0.00', currency_code: 'USD' },
    presentment_money: { amount: '0.00', currency_code: 'USD' }
  },
  total_shipping_price_set: {
    shop_money: { amount: '4.90', currency_code: 'USD' },
    presentment_money: { amount: '4.90', currency_code: 'USD' }
  },
  subtotal_price_set: {
    shop_money: { amount: '24.00', currency_code: 'USD' },
    presentment_money: { amount: '24.00', currency_code: 'USD' }
  },
  total_price_set: {
    shop_money: { amount: '31.29', currency_code: 'USD' },
    presentment_money: { amount: '31.29', currency_code: 'USD' }
  },
  total_tax_set: {
    shop_money: { amount: '2.39', currency_code: 'USD' },
    presentment_money: { amount: '2.39', currency_code: 'USD' }
  },
  line_items: [
    {
      id: 6355531858080,
      variant_id: 37313193377952,
      title: 'Short Sleeve T-Shirt',
      quantity: 1,
      sku: '',
      variant_title: 'MD / White',
      vendor: 'youronetruebabe',
      fulfillment_service: 'manual',
      product_id: 5892722163872,
      requires_shipping: true,
      taxable: true,
      gift_card: false,
      name: 'Short Sleeve T-Shirt - MD / White',
      variant_inventory_management: 'shopify',
      properties: [],
      product_exists: true,
      fulfillable_quantity: 1,
      grams: 181,
      price: '24.00',
      total_discount: '0.00',
      fulfillment_status: null,
      price_set: [Object],
      total_discount_set: [Object],
      discount_allocations: [],
      duties: [],
      admin_graphql_api_id: 'gid://shopify/LineItem/6355531858080',
      tax_lines: [Array],
      origin_location: [Object]
    }
  ],
  fulfillments: [],
  refunds: [],
  total_tip_received: '0.0',
  original_total_duties_set: null,
  current_total_duties_set: null,
  admin_graphql_api_id: 'gid://shopify/Order/2922898653344',
  shipping_lines: [
    {
      id: 2419677200544,
      title: 'Standard',
      price: '4.90',
      code: 'Standard',
      source: 'shopify',
      phone: null,
      requested_fulfillment_service_id: null,
      delivery_category: null,
      carrier_identifier: null,
      discounted_price: '4.90',
      price_set: [Object],
      discounted_price_set: [Object],
      discount_allocations: [],
      tax_lines: [Array]
    }
  ],
  billing_address: {
    first_name: 'Brendan',
    address1: '3906 Willbert Rd.',
    phone: null,
    city: 'Austin',
    zip: '78751',
    province: 'Texas',
    country: 'United States',
    last_name: 'Bond',
    address2: 'Unit A',
    company: null,
    latitude: 30.2969074,
    longitude: -97.7208151,
    name: 'Brendan Bond',
    country_code: 'US',
    province_code: 'TX'
  },
  shipping_address: {
    first_name: 'Brendan',
    address1: '3906 Willbert Rd.',
    phone: null,
    city: 'Austin',
    zip: '78751',
    province: 'Texas',
    country: 'United States',
    last_name: 'Bond',
    address2: 'Unit A',
    company: null,
    latitude: 30.2969074,
    longitude: -97.7208151,
    name: 'Brendan Bond',
    country_code: 'US',
    province_code: 'TX'
  },
  client_details: {
    browser_ip: '67.198.97.185',
    accept_language: 'en-US,en;q=0.9',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
    session_hash: '3ee21ce6868dd49c085c545b1f864917',
    browser_width: 1516,
    browser_height: 937
  },
  payment_details: {
    credit_card_bin: '1',
    avs_result_code: null,
    cvv_result_code: null,
    credit_card_number: '•••• •••• •••• 1',
    credit_card_company: 'Bogus'
  },
  customer: {
    id: 4297931227296,
    email: 'brendanbond@gmail.com',
    accepts_marketing: false,
    created_at: '2020-11-30T16:29:22-05:00',
    updated_at: '2020-11-30T23:43:33-05:00',
    first_name: 'Brendan',
    last_name: 'Bond',
    orders_count: 0,
    state: 'disabled',
    total_spent: '0.00',
    last_order_id: null,
    note: null,
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    phone: null,
    tags: '',
    last_order_name: null,
    currency: 'USD',
    accepts_marketing_updated_at: '2020-11-30T16:29:22-05:00',
    marketing_opt_in_level: null,
    admin_graphql_api_id: 'gid://shopify/Customer/4297931227296',
    default_address: {
      id: 5054851907744,
      customer_id: 4297931227296,
      first_name: 'Brendan',
      last_name: 'Bond',
      company: null,
      address1: '3906 Willbert Rd.',
      address2: 'Unit A',
      city: 'Austin',
      province: 'Texas',
      country: 'United States',
      zip: '78751',
      phone: null,
      name: 'Brendan Bond',
      province_code: 'TX',
      country_code: 'US',
      country_name: 'United States',
      default: true
    }
  }
}
*/
