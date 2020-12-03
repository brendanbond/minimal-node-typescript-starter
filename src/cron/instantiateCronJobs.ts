import cron from 'node-cron';

import { vestEligiblePoints } from './vestEligiblePoints';

const cronJobs = [() => cron.schedule('* * * * *', vestEligiblePoints)];

export const instantiateCronJobs = () => {
  cronJobs.forEach((cronJobFn) => cronJobFn());
};
