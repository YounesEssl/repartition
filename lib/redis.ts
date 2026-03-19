import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

const STATE_KEY = "room-assignments";

export async function loadState() {
  return redis.get(STATE_KEY);
}

export async function saveState(state: unknown) {
  await redis.set(STATE_KEY, state);
}
