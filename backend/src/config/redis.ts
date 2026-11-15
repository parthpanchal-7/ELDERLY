import { Redis } from 'ioredis';
import { ENV } from './env.js';

let redisClient: Redis | null = null;
let isConnected = false;

if (ENV.REDIS_URL) {
  try {
    redisClient = new Redis(ENV.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 5) {
          console.warn('[Redis] Max reconnection attempts reached. Continuing in memory-only mode.');
          return null; // Stop reconnecting after 5 tries
        }
        return Math.min(times * 1000, 3000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('✅ Connected to Redis cache/queue store');
    });

    redisClient.on('error', (err: any) => {
      isConnected = false;
      console.warn(`[Redis Notice] Connection warning: ${err.message}`);
    });

    // Initiate connection asynchronously
    redisClient.connect().catch((err) => {
      console.warn(`[Redis Notice] Could not establish initial connection: ${err.message}. Platform remains fully functional.`);
    });
  } catch (err: any) {
    console.warn(`[Redis Init Error] ${err.message}`);
    redisClient = null;
  }
} else {
  console.log('[Redis] No REDIS_URL configured. Running with in-memory caching.');
}

export const redis = redisClient;
export const isRedisConnected = () => isConnected;

/**
 * Cache helper with fallback to in-memory store
 */
const memCache = new Map<string, { value: string; expiry: number }>();

export async function getCache(key: string): Promise<string | null> {
  if (redis && isConnected) {
    try {
      return await redis.get(key);
    } catch {
      // fallback to memory
    }
  }
  const item = memCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memCache.delete(key);
    return null;
  }
  return item.value;
}

export async function setCache(key: string, value: string, ttlSeconds = 300): Promise<void> {
  if (redis && isConnected) {
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
      return;
    } catch {
      // fallback to memory
    }
  }
  memCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
}

export async function deleteCache(key: string): Promise<void> {
  if (redis && isConnected) {
    try {
      await redis.del(key);
      return;
    } catch {
      // fallback
    }
  }
  memCache.delete(key);
}
