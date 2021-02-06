import cron from 'node-cron';

import { vestEligiblePoints } from './vestEligiblePointsAndUpdateGiftEligibility';
import { tagEligibleCustomersWithVipOrOnApproval } from './tagEligibleCustomersWithVipOrOnApproval';

const cronJobs = [
  () => cron.schedule('* * * * *', vestEligiblePoints),
  () => cron.schedule('* * * * *', tagEligibleCustomersWithVipOrOnApproval),
];

export const instantiateCronJobs = () => {
  cronJobs.forEach((cronJobFn) => cronJobFn());
};
