import queue from 'queue';

import { vestEligiblePoints } from './vestEligiblePointsAndUpdateGiftEligibility';
import { tagEligibleCustomersWithVipOrOnApproval } from './tagEligibleCustomersWithVipOrOnApproval';
import { fetchRecentMostTenderTransactionsAndUpdateCache } from './fetchRecentMostTenderTransactionsAndUpdateCache';
import { processCachedTransactions } from './processCachedTransactions';

export const initiateQueue = () => {
  const q = queue();
  q.concurrency = 1;
  q.push(
    // fetchRecentMostTenderTransactionsAndUpdateCache,
    processCachedTransactions,
    vestEligiblePoints,
    tagEligibleCustomersWithVipOrOnApproval
  );

  q.on('end', () => {
    q.push(
      // fetchRecentMostTenderTransactionsAndUpdateCache,
      processCachedTransactions,
      vestEligiblePoints,
      tagEligibleCustomersWithVipOrOnApproval
    );
    q.start();
  });
  return q;
};
