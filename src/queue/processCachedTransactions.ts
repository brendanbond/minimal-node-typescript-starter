import {
  getAllTransactionEntryIds,
  getTransactionEntry,
  processNewOrderTransaction as processUnCachedOrderTransaction,
  processExistingOrderTransaction as processCachedOrderTransaction,
  getOrderEntry,
  writeTransactionEntry,
} from '../interactors';
import { TransactionEntry } from '../types';
import { asyncForEach } from '../utils';

export const processCachedTransactions = async () => {
  console.log("Processing cached transactions...");
  const cachedTransactionIds = await getAllTransactionEntryIds();

  await asyncForEach(cachedTransactionIds, async (cachedTransactionId) => {
    const transactionEntry = await getTransactionEntry(cachedTransactionId);
    if (!transactionEntry)
      throw new Error(
        'Transaction ID exists in the transactions set but not in the key store'
      );
    if (!transactionEntry.processedForPoints) {
      const orderId = transactionEntry.orderId;

      try {
        const orderEntry = await getOrderEntry(orderId);

        if (orderEntry) {
          await processCachedOrderTransaction(orderEntry, transactionEntry);
        } else {
          await processUnCachedOrderTransaction(transactionEntry);
        }

        const updatedTransactionEntry: TransactionEntry = {
          ...transactionEntry,
          processedForPoints: true,
        };
        await writeTransactionEntry(
          updatedTransactionEntry.id,
          updatedTransactionEntry
        );
      } catch (error) {
        console.error('Error during transaction processing:', error);
      }
    }
  });
};
