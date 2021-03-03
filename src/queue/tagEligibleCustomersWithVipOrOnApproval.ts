import * as Sentry from '@sentry/node';

import { addTagsToCustomerProfile } from '../integrations/shopify/customers';
import {
  getAllCustomerEntryIds,
  getCustomerEntry,
  writeCustomerEntry,
} from '../interactors';
import { asyncForEach } from '../utils';

export const tagEligibleCustomersWithVipOrOnApproval = async () => {
  try {
    console.log('Checking for points and tags...');
    const customerIds = await getAllCustomerEntryIds();

    await asyncForEach<number>(customerIds, async (customerId) => {
      const customerEntry = await getCustomerEntry(customerId);
      if (!customerEntry) {
        throw new Error(
          'Customer ID contained in customers set does not have corresponding customer entry'
        );
      }

      if (customerEntry.vestedPoints >= 2000 && !customerEntry.onApproval) {
        console.log(`Customer ${customerId} has reached On-Approval status!`);
        await addTagsToCustomerProfile(customerId, ['On-Approval']);
        const newCustomerEntry = { ...customerEntry, onApproval: true };
        await writeCustomerEntry(customerId, newCustomerEntry);
      }

      if (customerEntry.vestedPoints >= 1600 && !customerEntry.vip) {
        console.log(`Customer ${customerId} has reached VIP status!`);
        await addTagsToCustomerProfile(customerId, ['VIP']);
        const newCustomerEntry = { ...customerEntry, vip: true };
        await writeCustomerEntry(customerId, newCustomerEntry);
      }
    });
  } catch (error) {
    Sentry.captureException(error);
  }
};
