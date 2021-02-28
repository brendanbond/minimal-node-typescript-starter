import { Response } from 'express';

import { CustomerEntry, OrderEntry, TransactionEntry } from '../types';
import { ITenderTransactionWebhookRequest } from './types';
import {
  getCustomerEntry,
  getOrderEntry,
  writeCustomerEntry,
  writeOrderEntry,
  writeTransactionEntry,
  getTransactionEntry,
} from '../interactors';

export const handleTenderTransactionWebhookRequest = async (
  req: ITenderTransactionWebhookRequest,
  res: Response
) => {
  const { amount, order_id: orderId, id, processed_at: processedAt } = req.body;

  if (!orderId || !amount) {
    res.sendStatus(500);
    throw new Error(
      'Received malformed POST request from Shopify tender transaction webhook'
    );
  }

  const cachedTransaction = await getTransactionEntry(id);
  if (cachedTransaction) {
    console.log('Already received this transaction');
    res.sendStatus(200);
  } else {
    const transactionEntry: TransactionEntry = {
      id,
      orderId,
      amount,
      processedAt,
      processedForPoints: false,
    };
    await writeTransactionEntry(id, transactionEntry);
    res.sendStatus(200);
  }
};

/* SHAPE OF TENDER TRANSACTION POST REQUEST FROM SHOPIFY API 2020-10:
Got a new transaction.... {
  id: 220982911946154500,
  order_id: 820982911946154500,
  amount: '717.00',
  currency: null,
  user_id: null,
  test: false,
  processed_at: null,
  remote_reference: '1001',
  payment_details: {
    credit_card_number: '•••• •••• •••• 1234',
    credit_card_company: 'Visa'
  },
  payment_method: 'unknown'
}
*/
