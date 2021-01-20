import axios from 'axios';

import { IShopifyOrdersQueryResponseItem } from '../types';

const rootEndpoint = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}@${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/${process.env.SHOPIFY_API_VERSION}`;

// TODO: ADD PAGINATION
export const getOrdersSinceDate = async (
  date: string
): Promise<IShopifyOrdersQueryResponseItem[]> => {
  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_PASSWORD)
    throw new Error('Shopify API key and password cannot be null');
  const { data, status } = await axios.get(
    `${rootEndpoint}/orders.json?created_at_min=${date}`
  );
  if (status !== 200) {
    throw new Error('Order fetch returned negative status');
  }
  return data.orders;
};
