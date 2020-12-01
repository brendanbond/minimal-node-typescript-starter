import path from 'path';
import express from 'express';
import dayjs from 'dayjs';

// import { instantiateCronJobs } from './cronJobs';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handleNewOrderWebhookRequest,
  handleCancelOrderWebhookRequest,
} from './handlers';
import { rebuildGlobalCacheStateFromDate } from './utils';

const app = express();

app.use(express.json());

app.post('/new-order-webhook', handleNewOrderWebhookRequest);

app.post('/cancel-order-webhook', handleCancelOrderWebhookRequest);

app.post('/refund-order-webhook', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.post('/redeem', validateRedeemRequest, handleRedeemRequest);

// instantiateCronJobs();

const main = async () => {
  try {
    const launchDate = dayjs('2020-11-29T00:00:00-05:00');
    await rebuildGlobalCacheStateFromDate(launchDate);
  } catch (err) {
    console.error('Error while rebuilding global cache:', err);
  }

  const port = Number(process.env.SERVER_PORT) || 3000;

  app.listen(port, '127.0.0.1', () => {
    console.log('HTTP Server running on port ' + port);
  });
};

main();
