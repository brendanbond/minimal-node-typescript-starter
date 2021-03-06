/* eslint-disable import/no-mutable-exports */
import redis from 'redis';

let globalCache: redis.RedisClient;

console.log('process.env.REDIS_PORT', process.env.REDIS_PORT);

if (process.env.LOYALTY_POINTS_ENV) {
  globalCache = redis.createClient({
    prefix: `loyalty${
      process.env.LOYALTY_POINTS_ENV !== 'production'
        ? '-' + process.env.LOYALTY_POINTS_ENV
        : ''
    }:`,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  });
} else {
  globalCache = redis.createClient({
    prefix: 'loyalty-fallback:',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  });
}

globalCache.on('error', (error) => {
  console.error(error);
});

export { globalCache };
