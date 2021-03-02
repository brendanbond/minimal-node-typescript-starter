import axios from 'axios';
import * as rax from 'retry-axios';

import { ROOT_ENDPOINT } from '../../data/constants';
import { IShopifyOrderAPIResponse, ShopifyOrder } from './types';

const interceptorId = rax.attach();

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
