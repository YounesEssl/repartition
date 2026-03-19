import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const STATE_KEY = "room-assignments";

export async function loadState() {
  return redis.get(STATE_KEY);
}

export async function saveState(state: unknown) {
  await redis.set(STATE_KEY, state);
}
