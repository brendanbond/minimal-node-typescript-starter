import axios from 'axios';
import * as rax from 'retry-axios';
import {
  IShopifyTenderTransactionsResponse,
  ShopifyTenderTransaction,
} from './types';
import { ROOT_ENDPOINT } from '../../data/constants';

rax.attach();

export const fetchTenderTransactions = async (
  limit: number
): Promise<ShopifyTenderTransaction[]> => {
  try {
    const response = await axios.get<IShopifyTenderTransactionsResponse>(
      `${ROOT_ENDPOINT}/tender_transactions.json`,
      {
        params: {
          limit,
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
