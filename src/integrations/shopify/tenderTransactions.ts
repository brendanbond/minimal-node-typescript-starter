import axios from 'axios';
import axiosRetry from 'axios-retry';

import {
  IShopifyTenderTransactionsResponse,
  ShopifyTenderTransaction,
} from './types';
import { ROOT_ENDPOINT } from '../../data/constants';
import dayjs from 'dayjs';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 5, shouldResetTimeout: true });

export const fetchTenderTransactions = async (
  limit: number
): Promise<ShopifyTenderTransaction[]> => {
  try {
    const response = await axios.get<IShopifyTenderTransactionsResponse>(
      `${ROOT_ENDPOINT}/tender_transactions.json`,
      {
        params: {
          limit: limit,
        },
      }
    );
    return response.data.tender_transactions;
  } catch (err) {
    throw new Error(
      `Error while trying to fetch tender transactions from Shopify`
    );
  }
};
