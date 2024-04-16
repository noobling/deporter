import Redis from "ioredis";
import environment from "./environment";

const redis = new Redis(environment.redis_url);

console.log("Redis initialised with status", redis.status);

export const cacheGet = async (key: string) => {
  const result = await redis.get(key);
  return result ? JSON.parse(result) : null;
};

export const cacheSet = async (key: string, value: any) => {
  await redis.set(key, JSON.stringify(value));
};
