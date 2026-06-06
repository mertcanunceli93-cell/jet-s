import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let client: RedisClientType | null = null;
let connected = false;
let lastAttempt = 0;
const COOLDOWN = 60000; // 60 seconds - avoid log spam when Redis is unavailable

async function getClient(): Promise<RedisClientType | null> {
  if (client && connected) return client;
  
  const now = Date.now();
  if (!connected && now - lastAttempt < COOLDOWN) {
    return null;
  }
  
  lastAttempt = now;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!client) {
    client = createClient({
      url,
      socket: {
        tls: process.env.REDIS_TLS === 'true',
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
        connectTimeout: 2000,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (error) => {
      connected = false;
      logger.warn('redis.error', { message: error.message });
    });
  }

  try {
    // Add a manual timeout for safety
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    connected = true;
    logger.info('redis.connected');
  } catch (error: any) {
    connected = false;
    logger.warn('redis.unavailable', { message: error?.message });
    // Keep the client but don't try again until cooldown expires
  }

  return client;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const c = await getClient();
  if (!c || !connected) return null;
  const raw = await c.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function redisSetJson(key: string, value: unknown, ttlSeconds: number) {
  const c = await getClient();
  if (!c || !connected) return;
  await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function redisDelByPattern(pattern: string) {
  const c = await getClient();
  if (!c || !connected) return;
  const keys = await c.keys(pattern);
  if (!keys.length) return;
  await c.del(keys);
}

export async function redisIncrWithTtl(key: string, ttlSeconds: number): Promise<number | null> {
  const c = await getClient();
  if (!c || !connected) return null;
  const value = await c.incr(key);
  if (value === 1) {
    await c.expire(key, ttlSeconds);
  }
  return value;
}

export function redisIsConnected() {
  return connected;
}
