import axios from 'axios';
import axiosRetry from 'axios-retry';

import { ROOT_ENDPOINT } from '../../data/constants';
import { IShopifyOrderAPIResponse, ShopifyOrder } from './types';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 5, shouldResetTimeout: true  });

export const fetchOrder = async (orderId: number): Promise<ShopifyOrder> => {
  try {
    const response = await axios.get<IShopifyOrderAPIResponse>(
      `${ROOT_ENDPOINT}/orders/${orderId}.json`
    );
    return response.data.order;
  } catch (err) {
    console.error('Error while trying to fetch order from Shopify:', err);
    throw new Error(
      `Error while trying to fetch order ${orderId} from Shopify`
    );
  }
};
