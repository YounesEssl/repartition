import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const STATE_KEY = "room-assignments";

export async function loadState() {
  return redis.get(STATE_KEY);
}

export async function saveState(state: unknown) {
  await redis.set(STATE_KEY, state);
}
