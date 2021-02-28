import axios from 'axios';
import axiosRetry from 'axios-retry';

import {
  IShopifyTenderTransactionsResponse,
  ShopifyTenderTransaction,
} from './types';
import { ROOT_ENDPOINT } from '../../data/constants';
import dayjs from 'dayjs';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

export const fetchTenderTransactions = async (
  sinceDate?: string,
  limit?: number
): Promise<ShopifyTenderTransaction[]> => {
  try {
    const response = await axios.get<IShopifyTenderTransactionsResponse>(
      `${ROOT_ENDPOINT}/tender_transactions.json`,
      {
        params: {
          limit: limit || 50,
          ...(sinceDate ? { processed_at_min: sinceDate } : {}),
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
