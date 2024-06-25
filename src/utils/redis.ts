import Redis from "ioredis";
import environment from "./environment";

let redis = {
  get() {
    return null;
  },
  set() {
    return null;
  },
  keys() {
    return [];
  },
  mget() {
    return [];
  },
  del() {
    return null;
  },
} as unknown as Redis;
try {
  redis = new Redis(environment.redis_url);
  console.log("Redis initialised with status", redis.status);
} catch (err) {
  console.error("Failed to connect to Redis", err);
}

export const cacheGet = async (key: string) => {
  const result = await redis.get(key);
  return result ? JSON.parse(result) : null;
};

/**
 * 
 * @param key 
 * @param value 
 * @param expiry time in seconds
 */
export const cacheSet = async (
  key: string,
  value: any,
  expiry?: number
) => {
  if (expiry !== undefined) {
    await redis.set(key, JSON.stringify(value), "EX", expiry);
    return
  }
  await redis.set(key, JSON.stringify(value));
};


export const cacheGetByPrefix = async (prefix: string) => {
  const keys = await redis.keys(`${prefix}*`);
  const results = await redis.mget(keys);
  return results.flatMap((r) => (r ? [JSON.parse(r)] : []));
};

export const cacheDelete = async (key: string) => {
  await redis.del(key);
};
