import redis from "redis";

const globalCache = redis.createClient();

globalCache.on("error", (error) => {
  console.error(error);
});

export default globalCache;
