import { Request, Response, NextFunction } from 'express';

import { getCustomerEntry } from '../interactors';
import { gifts } from '../data';

export const validateRedeemRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { customerId, giftId },
  } = req;

  if (!customerId)
    return res.status(400).send('Bad request: ID cannot be null');
  if (!giftId)
    return res
      .status(400)
      .send('Bad request: gift to redeem ID cannot be null');
  const giftToRedeem = gifts.find((gift) => gift.id === giftId);
  if (!giftToRedeem) return res.status(500).send('Gift to redeem not found');

  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) return res.status(404).send('Customer not found');

  if (
    customerEntry.redeemed.findIndex((giftId) => giftId === giftToRedeem.id) >
    -1
  ) {
    return res.status(500).send('Customer has already redeemed this gift');
  }
  if (customerEntry.vestedPoints < giftToRedeem.pointsNeeded) {
    return res.status(500).send('Customer is not yet eligible for this gift');
  }
  res.locals.customerEntry = customerEntry;
  next();
};

export default validateRedeemRequest;
