import { Response } from 'express';
import { IRedeemRequest } from './types';
import { CustomerEntry, ITargetVariant } from '../types';
import { generateEncodedPriceRuleTitle } from '../utils';
import {
  createPriceRule,
  createDiscountCode,
  updatePriceRule,
} from '../integrations/shopify/priceRules';
import { calculateSumPriceOfTargetVariants } from '../integrations/shopify/products';
import { markGiftsTransacting } from '../interactors';

export const handleRedeemRequest = async (
  req: IRedeemRequest,
  res: Response
) => {
  const {
    body: { customerId },
  } = req;
  const customerEntry = res.locals.customerEntry as CustomerEntry;
  const targetVariants = res.locals.targetVariants as ITargetVariant[];
  if (!customerId || !customerEntry) {
    return res
      .status(500)
      .send(
        'Error during redeem request - lost customer object or request params'
      );
  }

  const targetVariantIds = targetVariants.map(({ variantId }) => variantId);
  const amount = await calculateSumPriceOfTargetVariants(targetVariantIds);
  try {
    let priceRule: any;
    let discountCode: string;
    if (customerEntry.currentPriceRuleId) {
      priceRule = await updatePriceRule({
        newAmount: amount,
        priceRuleId: customerEntry.currentPriceRuleId,
        updatedTargetVariantIds: targetVariantIds,
      });
      discountCode = priceRule.title;
    } else {
      const newTitle = generateEncodedPriceRuleTitle(
        targetVariants.map(({ giftLevelId }) => giftLevelId)
      );
     priceRule = await createPriceRule({
        customerId,
        amount,
        targetVariantIds: targetVariants.map(({ variantId }) => variantId),
        newTitle,
      });
      console.log('priceRule:', priceRule);
      discountCode = await createDiscountCode({
        priceRuleId: priceRule.id,
        priceRuleTitle: priceRule.title,
      });
    }

    await markGiftsTransacting(
      customerId,
      targetVariants.map(({ giftLevelId }) => giftLevelId),
      priceRule.id
    );

    res.send({ discountCode });
  } catch (error) {
    console.log('Error in redeem request handler!', error);
  }
};

/*
available: (...)
barcode: (...)
compare_at_price: (...)
featured_image: (...)
featured_media: (...)
id: (...)
inventory_management: (...)
name: (...)
option1: (...)
option2: (...)
option3: (...)
options: (...)
price: (...)
public_title: (...)
requires_selling_plan: (...)
requires_shipping: (...)
selling_plan_allocations: (...)
sku: (...)
taxable: (...)
title: (...)
weight: (...)
*/
