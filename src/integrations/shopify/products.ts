import axios from 'axios';
import * as rax from 'retry-axios';
import { ROOT_ENDPOINT } from '../../data/constants';

const interceptorId = rax.attach();

export const calculateSumPriceOfTargetVariants = async (
  targetVariantIds: number[]
) => {
  const products = await Promise.all(
    targetVariantIds.map(async (variantId) => {
      try {
        const { data } = await axios.get(
          `${ROOT_ENDPOINT}/variants/${variantId}.json`
        );
        return data.variant;
      } catch (e) {
        console.error('error while fetching variants to calculate sum price');
        throw e;
      }
    })
  );
  return products.reduce((acc, { price }) => acc + Number(price), 0);
};
