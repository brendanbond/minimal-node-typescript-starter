import axios from 'axios';
import { ROOT_ENDPOINT } from '../../data/constants';

export const createPriceRule = ({
  amount,
  customerId,
  targetVariantIds,
  newTitle,
}: {
  amount: number;
  customerId: number;
  targetVariantIds: number[];
  newTitle: string;
}) => {
  return axios.post(ROOT_ENDPOINT + '/price_rules.json', {
    data: {
      price_rule: {
        title: newTitle,
        value_type: 'fixed_amount',
        value: `-${amount}`,
        customer_selection: 'prerequisite',
        target_type: 'line_item',
        target_selection: 'entitled',
        allocation_method: 'across',
        prerequisite_customer_ids: [customerId],
        prerequisite_variant_ids: targetVariantIds,
        once_per_customer: true,
        usage_limit: 1,
        allocation_limit: 1,
      },
    },
  });
};

export const updatePriceRule = ({
  newAmount,
  priceRuleId,
  updatedTargetVariantIds,
}: {
  newAmount: number;
  priceRuleId: number;
  updatedTargetVariantIds: number[];
}) => {
  return axios.put(ROOT_ENDPOINT + `/price_rules/${priceRuleId}.json`, {
    data: {
      price_rule: {
        id: priceRuleId,
        amount: newAmount,
        prerequisite_variant_ids: [updatedTargetVariantIds],
      },
    },
  });
};

export const createDiscountCode = async ({
  priceRuleId,
  priceRuleTitle,
}: {
  priceRuleId: number;
  priceRuleTitle: string;
}) => {
  const res = await axios.post(
    ROOT_ENDPOINT + `/price_rules/${priceRuleId}/discount_codes.json`,
    {
      data: {
        discount_code: {
          code: priceRuleTitle,
        },
      },
    }
  );
  if (typeof res.data.discount_code?.code !== 'string') {
    throw new Error(
      'problem generating discount code for priceRuleId ' + priceRuleId
    );
  }
  return res.data.discount_code?.code as string;
};
