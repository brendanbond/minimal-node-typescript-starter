import axios from 'axios';
import axiosRetry from 'axios-retry';

import { ROOT_ENDPOINT } from '../../data/constants';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 5 });

const fetchCustomerTags = async (customerId: number): Promise<string> => {
  try {
    const response = await axios.get(
      ROOT_ENDPOINT + `/customers/${customerId}.json`
    );
    const { customer } = response.data;
    return customer.tags;
  } catch (err) {
    throw new Error('Error while trying to get customer tags');
  }
};

export const addTagsToCustomerProfile = async (
  customerId: number,
  tags: string[]
) => {
  try {
    const existingTags = await fetchCustomerTags(customerId);
    await axios.put(ROOT_ENDPOINT + `/customers/${customerId}.json`, {
      customer: {
        id: customerId,
        tags: `${existingTags}, ${tags.join(', ')}`,
      },
    });
  } catch (err) {
    console.error('error:', err);
    throw new Error('Error while trying to add tag to customer profile');
  }
};
