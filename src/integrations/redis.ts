import redis from 'redis';
import { Customer } from '../types';

const globalCache = redis.createClient();

globalCache.on('error', (error) => {
  console.error(error);
});

export default globalCache;


