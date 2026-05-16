import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const isTLS = redisUrl.startsWith('rediss://');

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  ...(isTLS ? { tls: {} } : {}),  // required for Upstash rediss:// URLs
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 500, 2000);
  },
});

redis.on('error', (err) => {
  console.warn('[redis] connection error (non-fatal):', err.message);
});
