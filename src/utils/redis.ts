import Redis from "ioredis";
import environment from "./environment";

let redis = {
  get() {
    return null;
  },
  set() {
    return null;
  },
} as any;
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

export const cacheSet = async (key: string, value: any) => {
  await redis.set(key, JSON.stringify(value));
};
