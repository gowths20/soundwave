import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  lazyConnect: true,          // don't connect on import — connect on first use
  maxRetriesPerRequest: 1,    // fail fast instead of hanging
  enableOfflineQueue: false,  // don't queue commands when disconnected
  retryStrategy: (times) => {
    if (times > 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 500, 2000);
  },
});

redis.on('error', (err) => {
  // log but don't crash — Redis is optional for basic playback
  console.warn('[redis] connection error (non-fatal):', err.message);
});
