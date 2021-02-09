import axios from 'axios';

import { IShopifyOrdersQueryResponseItem } from '../types';
import { ROOT_ENDPOINT } from '../data/constants';

// TODO: ADD PAGINATION
export const getOrdersSinceDate = async (
  date: string
): Promise<IShopifyOrdersQueryResponseItem[]> => {
  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_PASSWORD)
    throw new Error('Shopify API key and password cannot be null');
  const { data, status } = await axios.get(
    `${ROOT_ENDPOINT}/orders.json?created_at_min=${date}`
  );
  if (status !== 200) {
    throw new Error('Order fetch returned negative status');
  }
  return data.orders;
};
