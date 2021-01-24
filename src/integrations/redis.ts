import redis from 'redis';

let globalCache: redis.RedisClient;

if (process.env.LOYALTY_POINTS_ENV) {
  globalCache = redis.createClient({
    prefix: process.env.LOYALTY_POINTS_ENV + ':',
  });
} else {
  globalCache = redis.createClient({
    prefix: 'loyalty-fallback:',
  });
}

globalCache.on('error', (error) => {
  console.error(error);
});

export { globalCache };
