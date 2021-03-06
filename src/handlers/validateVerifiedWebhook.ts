import { NextFunction, Request, Response } from 'express';

export const validateVerifiedWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.get(`x-${process.env.SHOPIFY_SHOP_NAME}-webhook-verified`) === '200'
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};
