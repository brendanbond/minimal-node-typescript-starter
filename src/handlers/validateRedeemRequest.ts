import { Response, NextFunction } from 'express';

import { getCustomerEntry } from '../interactors';
import { giftLevels } from '../data';
import { CustomerEntry, GiftRedemptionStatus, ITargetVariant } from '../types';
import { IRedeemRequest } from './types';

const testGiftLevel = (giftLevelId: any) => {
  console.log('giftLevelId:', giftLevelId);
  if (typeof giftLevelId !== 'number') {
    console.log('giftLevelId is not a number, returning false');
    return false;
  }
  if (giftLevels.findIndex(({ id }) => id === giftLevelId) === -1) {
    console.log('giftLevelId not found in constants');
    return false;
  }
  return true;
};

const validateSelectedVariants: (
  selectedVariants: unknown
) => ITargetVariant[] = (selectedVariants: unknown) => {
  if (!Array.isArray(selectedVariants)) {
    throw new Error('selectedVariants not submitted as Array');
  }
  if (selectedVariants.length === 0) {
    throw new Error('no elements in selectedVariants Array');
  }
  let returnVariants: ITargetVariant[] = [];
  for (let i = 0; i < selectedVariants.length; i++) {
    let cur = selectedVariants[i];
    let target = {
      variantId: -1,
      giftLevelId: -1,
    };
    if (typeof cur.variantId === 'number') {
      target.variantId = cur.variantId;
    } else {
      throw new Error('variantId malformed');
    }
    if (testGiftLevel(cur.giftLevelId)) {
      target.giftLevelId = cur.giftLevelId;
    } else {
      throw new Error('giftLevelId malformed');
    }
    returnVariants.push(target);
  }
  return returnVariants;
};

const validateGiftNotYetRedeemed = (
  variant: ITargetVariant,
  redeemed: CustomerEntry['gifts']
) => {
  for (let i = 0; i < redeemed.length; i++) {
    const cur = redeemed[i];
    const { giftLevelId } = variant;
    if (giftLevelId === cur.giftLevelId) {
      if (cur.status === GiftRedemptionStatus.REDEEMED) {
        throw new Error('Gift already redeemed, giftLevelId: ' + giftLevelId);
      }
    }
  }
  return true;
};

const validateGiftElibility = (
  variant: ITargetVariant,
  customerVestedPoints: CustomerEntry['vestedPoints']
) => {
  const matchedGiftLevel = giftLevels.find(
    ({ id }) => id === variant.giftLevelId
  );
  if (
    !matchedGiftLevel ||
    matchedGiftLevel?.pointsNeeded > customerVestedPoints
  ) {
    throw new Error(
      'User does not have sufficient vested points to redeem giftLevelId' +
        variant.giftLevelId
    );
  }
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

  console.log('Validating redeem request...', req.body);
  if (!customerId)
    return res.status(400).send('Bad request: ID cannot be null');
  if (!selectedVariants)
    return res
      .status(400)
      .send('Bad request: gift to redeem ID cannot be null');
  const customerEntry = await getCustomerEntry(customerId);
  if (!customerEntry) return res.status(404).send('Customer not found');
  const validatedVariants = validateSelectedVariants(selectedVariants);
  if (!validatedVariants)
    return res.status(500).send('Bad request: selectedVariants malformed');
  validatedVariants.forEach((variant: ITargetVariant) => {
    const giftEligible = validateGiftElibility(
      variant,
      customerEntry.vestedPoints
    );
    if (!giftEligible) {
      return res
        .status(500)
        .send(
          'Bad request: Customer is not yet eligible for this gift ' +
            variant.giftLevelId
        );
    }
  });
  validatedVariants.forEach((variant: ITargetVariant) => {
    const giftLevelAlreadyRedeemed = validateGiftNotYetRedeemed(
      variant,
      customerEntry.gifts
    );
    if (!giftLevelAlreadyRedeemed) {
      return res
        .status(500)
        .send(
          'Bad request: gift level already redeemed ' + giftLevelAlreadyRedeemed
        );
    }
  });
  res.locals.targetVariants = validatedVariants;
  res.locals.customerEntry = customerEntry;
  next();
};

export default validateRedeemRequest;
