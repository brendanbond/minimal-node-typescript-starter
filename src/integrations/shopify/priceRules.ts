import axios from 'axios';
import { ROOT_ENDPOINT } from '../../data/constants';
import { v4 as uuid } from 'uuid';

export const createPriceRule = ({
  amount,
  customerId,
  targetVariantIds,
}: {
  amount: number;
  customerId: number;
  targetVariantIds: number[];
}) => {
  return axios.post(ROOT_ENDPOINT + '/price_rules.json', {
    data: {
      price_rule: {
        title: 'loyalty-' + uuid(),
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
  priceRuleId: string;
  updatedTargetVariantIds: string[];
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

export const createDiscountCode = ({
  priceRuleId,
  priceRuleTitle,
}: {
  priceRuleId: string;
  priceRuleTitle: string;
}) => {
  return axios.post(
    ROOT_ENDPOINT + `/price_rules/${priceRuleId}/discount_codes.json`,
    {
      data: {
        discount_code: {
          code: priceRuleTitle,
        },
      },
    }
  );
};
