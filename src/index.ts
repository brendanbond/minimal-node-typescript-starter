import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';
import axiosRetry from 'axios-retry';
axiosRetry(axios, { retries: 10, retryDelay: axiosRetry.exponentialDelay });

import { instantiateCronJobs } from './cron';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handleNewOrderWebhookRequest,
  handleCancelOrderWebhookRequest,
  handleRefundOrderWebhookRequest,
  handlePointsRequest,
  handleValidateRequest,
  handleConstantsRequest,
} from './handlers';

instantiateCronJobs();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.post('/new-order-webhook', handleNewOrderWebhookRequest);
// it looks like cancelling an order will fire both the refund and the cancel webhooks, rendering cancel obsolote
// app.post('/cancel-order-webhook', handleCancelOrderWebhookRequest);
app.post('/refund-order-webhook', handleRefundOrderWebhookRequest);
app.post('/redeem', validateRedeemRequest, handleRedeemRequest);
app.get('/points/:customerId', handlePointsRequest);
app.get('/validate/:customerId', handleValidateRequest);
app.get('/constants', handleConstantsRequest);

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT || 3000}`);
  console.log('NODE_ENV =', process.env.NODE_ENV);
});
