import express, { Request, Response } from 'express';
import crypto from 'crypto';
import cors from 'cors';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import * as SentryTracing from '@sentry/tracing';

import { initiateQueue } from './queue';
// import { instantiateCronJobs } from './cron';
import {
  handleRedeemRequest,
  validateRedeemRequest,
  handlePointsRequest,
  handleValidateRequest,
  handleConstantsRequest,
  handleTenderTransactionWebhookRequest,
  validateVerifiedWebhook,
} from './handlers';

const validateWebhook = (req: Request, res: Response, buffer: Buffer) => {
  if (req.url.includes('/tender-transaction-webhook')) {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    if (!hmac) {
      res.sendStatus(403);
      return;
    }
    if (req.get(`x-${process.env.SHOPIFY_SHOP_NAME}-webhook-verified`))
      throw new Error('Unexpected webhook verified header');
    if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
      throw new Error('Shopify webhook secret cannot be undefined');
    }
    if (!buffer) {
      res.sendStatus(403);
      return;
    }

    const hash = crypto
      .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
      .update(buffer)
      .digest('base64');
    console.log('hash =>', hash);

    if (hmac === hash) {
      req.headers[`x-${process.env.SHOPIFY_SHOP_NAME}-webhook-verified`] =
        '200';
    } else {
      res.sendStatus(403);
    }
  }
};

const queue = initiateQueue();
// instantiateCronJobs();

const app = express();

Sentry.init({
  dsn:
    'https://5d61867c3925498f87159f678f737bd3@o423972.ingest.sentry.io/5658505',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new SentryTracing.Integrations.Express({
      app,
    }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
app.use(Sentry.Handlers.tracingHandler());
app.use(express.json({ verify: validateWebhook }));
app.use(cors());
app.use(morgan('dev'));

app.post(
  '/tender-transaction-webhook',
  validateVerifiedWebhook,
  handleTenderTransactionWebhookRequest
);
app.post('/redeem', validateRedeemRequest, handleRedeemRequest);
app.get('/points/:customerId', handlePointsRequest);
app.get('/validate/:customerId', handleValidateRequest);
app.get('/constants', handleConstantsRequest);

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT || 3000}`);
  console.log('NODE_ENV =', process.env.NODE_ENV);
  queue.start();
});
