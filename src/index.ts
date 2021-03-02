import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { initiateQueue } from './queue';
// import { instantiateCronJobs } from './cron';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handlePointsRequest,
  handleValidateRequest,
  handleConstantsRequest,
  handleTenderTransactionWebhookRequest,
} from './handlers';

const queue = initiateQueue();
// instantiateCronJobs();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.post('/tender-transaction-webhook', handleTenderTransactionWebhookRequest);

app.post('/redeem', validateRedeemRequest, handleRedeemRequest);

app.get('/points/:customerId', handlePointsRequest);

app.get('/validate/:customerId', handleValidateRequest);

app.get('/constants', handleConstantsRequest);

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT || 3000}`);
  console.log('NODE_ENV =', process.env.NODE_ENV);
  queue.start();
});
