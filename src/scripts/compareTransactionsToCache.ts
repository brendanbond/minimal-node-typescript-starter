import dayjs from 'dayjs';
import dotenv from 'dotenv';

import { fetchTenderTransactions } from '../integrations/shopify/tenderTransactions';
import { getAllTransactionEntryIds } from '../interactors';

dotenv.config({ path: ".env" });

const compareTransactionsToCache = async () => {
  let finished = false;
  let sinceDate = '2021-03-06T00:00:00-06:00';

  while (!finished) {
    const tenderTransactions = await fetchTenderTransactions(250, sinceDate);
    const cachedTransactionIds = await getAllTransactionEntryIds();

    tenderTransactions.forEach((transaction) => {
      const matchedTransactionId = cachedTransactionIds.find(
        (transactionId) => transactionId === transaction.id
      );

      if (matchedTransactionId) {
        console.log(
          `Shopify transaction ${transaction.id} matched with cached transaction ${matchedTransactionId}`
        );
      } else {
        console.log(
          `Can't find matching cached transaction for Shopify transaction ${transaction.id}`
        );
      }
    });

    if (
      dayjs(
        tenderTransactions[tenderTransactions.length - 1].processed_at
      ).isSame(dayjs(), 'date')
    ) {
      finished = true;
    } else {
      sinceDate =
        tenderTransactions[tenderTransactions.length - 1].processed_at;
    }
  }
};

const main = async () => {
  await compareTransactionsToCache();
};

void main();
