import dayjs from 'dayjs';

import { fetchTenderTransactions } from '../integrations/shopify/tenderTransactions';
import {
  getAllTransactionEntryIds,
  writeTransactionEntry,
} from '../interactors';
import { asyncForEach } from '../utils';

export const fetchRecentMostTenderTransactionsAndUpdateCache = async () => {
  console.log('Fetching recent transactions and updating cache...');
  const sinceDate = dayjs().subtract(1, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
  const recentMostTenderTransactions = await fetchTenderTransactions(sinceDate);
  const cachedTransactionIds = await getAllTransactionEntryIds();

  await asyncForEach(
    recentMostTenderTransactions,
    async (tenderTransaction) => {
      const matchingTenderTransaction = cachedTransactionIds.find(
        (cachedTransactionId) => cachedTransactionId === tenderTransaction.id
      );
      if (matchingTenderTransaction) {
        return;
      } else {
        console.log(
          `Found uncached transaction with ID ${tenderTransaction.id}, writing to cache...`
        );
        await writeTransactionEntry(tenderTransaction.id, {
          id: tenderTransaction.id,
          orderId: tenderTransaction.order_id,
          amount: tenderTransaction.amount,
          processedAt: tenderTransaction.processed_at,
          processedForPoints: false,
        });
      }
    }
  );
};
