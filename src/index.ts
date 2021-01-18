import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { instantiateCronJobs } from './cron';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handleNewOrderWebhookRequest,
  handleCancelOrderWebhookRequest,
  handleRefundOrderWebhookRequest,
  handlePointsRequest,
  handleValidateRequest,
} from './handlers';

instantiateCronJobs();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.post('/new-order-webhook', handleNewOrderWebhookRequest);
app.post('/cancel-order-webhook', handleCancelOrderWebhookRequest);
app.post('/refund-order-webhook', handleRefundOrderWebhookRequest);
app.post('/redeem', validateRedeemRequest, handleRedeemRequest);
app.get('/points/:customerId', handlePointsRequest);
app.get('/validate/:customerId', handleValidateRequest);

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT || 3000}`);
});
