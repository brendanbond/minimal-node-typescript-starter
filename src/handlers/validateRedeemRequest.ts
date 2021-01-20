import { Request, Response, NextFunction } from 'express';

import { getCustomerEntry } from '../interactors';
import { gifts } from '../data';
import { CustomerEntry } from '../types';
import { IRedeemRequest } from './types';

const validateSelectedVariants = (selectedVariants: any[]) => {
  return true;
};

const validateGiftNotYetRedeemed = (
  variant: any,
  redeemed: CustomerEntry['redeemed']
) => {
  return true;
};

const validateGiftElibility = (
  variant: any,
  customerVestedPoints: CustomerEntry['vestedPoints']
) => {
  return true;
};
export const validateRedeemRequest = async (
  req: IRedeemRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { customerId, selectedVariants },
  } = req;

  if (!customerId)
    return res.status(400).send('Bad request: ID cannot be null');
  if (!selectedVariants)
    return res
      .status(400)
      .send('Bad request: gift to redeem ID cannot be null');
  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) return res.status(404).send('Customer not found');
  const selectedVariantsValid = validateSelectedVariants(selectedVariants);
  if (!selectedVariantsValid)
    return res.status(500).send('Bad request: selectedVariants malformed');
  selectedVariants.forEach((variant: any) => {
    const giftLevelAlreadyRedeemed = validateGiftNotYetRedeemed(
      variant,
      customerEntry.redeemed
    );
    if (!giftLevelAlreadyRedeemed) {
      return res
        .status(500)
        .send(
          'Bad request: gift level already redeemed ' + giftLevelAlreadyRedeemed
        );
    }
  });
  selectedVariants.forEach((variant: any) => {
    const ineligibleGiftLevel = validateGiftElibility(
      variant,
      customerEntry.vestedPoints
    );
    if (ineligibleGiftLevel) {
      return res
        .status(500)
        .send(
          'Bad request: Customer is not yet eligible for this gift ' +
            ineligibleGiftLevel
        );
    }
  });
  res.locals.customerEntry = customerEntry;
  next();
};

export default validateRedeemRequest;
