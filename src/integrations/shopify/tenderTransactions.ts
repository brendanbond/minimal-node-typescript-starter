import axios from 'axios';
import * as rax from 'retry-axios';
import dayjs from 'dayjs';

import {
  IShopifyTenderTransactionsResponse,
  ShopifyTenderTransaction,
} from './types';
import { ROOT_ENDPOINT } from '../../data/constants';

rax.attach();

export const fetchTenderTransactions = async (
  limit: number,
  sinceDate?: string
): Promise<ShopifyTenderTransaction[]> => {
  try {
    const response = await axios.get<IShopifyTenderTransactionsResponse>(
      `${ROOT_ENDPOINT}/tender_transactions.json`,
      {
        params: {
          limit,
          ...(sinceDate && { processed_at_min: dayjs(sinceDate).format() }),
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
