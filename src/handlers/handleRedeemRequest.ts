import { Response } from 'express';
import { IRedeemRequest } from './types';
import { generateEncodedPriceRuleTitle } from '../utils/priceRuleTitle';
import {
  createPriceRule,
  createDiscountCode,
} from '../integrations/shopify/priceRules';
import { calculateSumPriceOfTargetVariants } from '../integrations/shopify/products';

export const handleRedeemRequest = async (
  req: IRedeemRequest,
  res: Response
) => {
  const {
    body: { customerId },
  } = req;
  const customerEntry = res.locals.customerEntry;
  if (!customerId || !customerEntry) {
    return res
      .status(500)
      .send(
        'Error during redeem request - lost customer object or request params'
      );
  }
  try {
    const { selectedVariants } = req.body;
    const newTitle = generateEncodedPriceRuleTitle(
      selectedVariants.map(({ giftLevel }) => giftLevel)
    );
    const targetVariantIds = selectedVariants.map(({ variantId }) => variantId);
    const amount = await calculateSumPriceOfTargetVariants(targetVariantIds);
    const priceRule: any = await createPriceRule({
      customerId,
      amount,
      targetVariantIds: selectedVariants.map(({ variantId }) => variantId),
    });
    const discountCode = await createDiscountCode({
      priceRuleId: priceRule.id,
      priceRuleTitle: priceRule.title,
    });
    res.send(discountCode);
  } catch (error) {
    // deal with error
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
