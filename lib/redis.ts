import { Redis } from '@upstash/redis'

// Ensure we don't throw immediately on import if env vars are missing,
// but warn the user.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Cache wrapper utility.
 * @param key - The unique cache key.
 * @param fetcher - The function to call if there's a cache miss.
 * @param ttlSeconds - Time-to-live in seconds (default 60).
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // If no URL/Token, just bypass cache
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return fetcher()
  }

  let cachedData: { v: T } | null = null;
  try {
    cachedData = await redis.get<{ v: T }>(key)
  } catch (error) {
    console.warn(`[Redis Cache Error - GET] Key: ${key}`, error)
  }

  if (cachedData !== null) {
    console.log(`[Redis Cache Hit] Key: ${key}`)
    return cachedData.v
  }

  console.log(`[Redis Cache Miss] Key: ${key}`)
  
  const data = await fetcher() // Let fetcher throw naturally without wrapping in Redis catch

  try {
    await redis.set(key, { v: data }, { ex: ttlSeconds })
  } catch (error) {
    console.warn(`[Redis Cache Error - SET] Key: ${key}`, error)
  }

  return data
}

/**
 * Basic rate limiting utility.
 * @param key - The unique identifier (e.g., userId).
 * @param limit - Max number of requests allowed in the window.
 * @param windowSeconds - The time window in seconds.
 * @returns true if allowed, false if rate limited.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return true // bypass if not configured
  }

  try {
    const rateKey = `ratelimit:${key}`
    const current = await redis.incr(rateKey)
    if (current === 1) {
      await redis.expire(rateKey, windowSeconds)
    }
    return current <= limit
  } catch (error) {
    console.warn(`[Redis RateLimit Error] Key: ${key}`, error)
    return true // fail open if Redis is down
  }
}
