import express from 'express';
import cors from 'cors';

import { instantiateCronJobs } from './cron';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handleNewOrderWebhookRequest,
  handleCancelOrderWebhookRequest,
  handleRefundOrderWebhookRequest,
  handlePointsRequest,
} from './handlers';

const app = express();

app.use(express.json());
app.use(cors());

app.post('/new-order-webhook', handleNewOrderWebhookRequest);

app.post('/cancel-order-webhook', handleCancelOrderWebhookRequest);

app.post('/refund-order-webhook', handleRefundOrderWebhookRequest);

app.post('/redeem', validateRedeemRequest, handleRedeemRequest);

app.get('/points/:customerId', handlePointsRequest);

instantiateCronJobs();

const port = Number(process.env.SERVER_PORT) || 3000;

app.listen(port, '127.0.0.1', () => {
  console.log('HTTP Server running on port ' + port);
});
