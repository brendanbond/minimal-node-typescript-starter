import queue from 'queue';

import { vestEligiblePoints } from './vestEligiblePointsAndUpdateGiftEligibility';
import { tagEligibleCustomersWithVipOrOnApproval } from './tagEligibleCustomersWithVipOrOnApproval';
import { processCachedTransactions } from './processCachedTransactions';
import { sleep } from '../utils';

export const initiateQueue = () => {
  const q = queue();
  q.concurrency = 1;
  q.push(
    processCachedTransactions,
    vestEligiblePoints,
    tagEligibleCustomersWithVipOrOnApproval,
    () => sleep(30000)
  );

  q.on('end', () => {
    q.push(
      processCachedTransactions,
      vestEligiblePoints,
      tagEligibleCustomersWithVipOrOnApproval,
      () => sleep(30000)
    );
    q.start();
  });
  return q;
};
