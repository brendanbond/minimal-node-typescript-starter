import cron from 'node-cron';

import { vestEligiblePoints } from './vestEligiblePoints';

const cronJobs = [() => cron.schedule('0 */1 * * *', vestEligiblePoints)];

export const instantiateCronJobs = () => {
  cronJobs.forEach((cronJobFn) => cronJobFn());
};
