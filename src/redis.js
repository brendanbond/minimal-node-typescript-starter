const redis = require("redis");

const globalCache = redis.createClient();

globalCache.on("error", (error) => {
  console.error(error);
});

module.exports = globalCache;
