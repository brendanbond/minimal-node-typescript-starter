import queue from 'queue';

import { vestEligiblePoints } from './vestEligiblePointsAndUpdateGiftEligibility';
import { tagEligibleCustomersWithVipOrOnApproval } from './tagEligibleCustomersWithVipOrOnApproval';
import { processCachedTransactions } from './processCachedTransactions';

export const initiateQueue = () => {
  const q = queue();
  q.concurrency = 1;
  q.push(
    processCachedTransactions,
    vestEligiblePoints,
    tagEligibleCustomersWithVipOrOnApproval
  );

  q.on('end', () => {
    q.push(
      processCachedTransactions,
      vestEligiblePoints,
      tagEligibleCustomersWithVipOrOnApproval
    );
    q.start();
  });
  return q;
};
