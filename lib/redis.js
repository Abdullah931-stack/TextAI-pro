// ============================================
// TextAIPRO - Redis Client (Singleton Pattern)
// ============================================
// HTTP-compatible for Serverless environments (Vercel Edge)
// Uses @upstash/redis for Redis operations

import { Redis } from '@upstash/redis';

/**
 * Singleton Redis client instance
 * @type {Redis|null}
 */
let redisClient = null;

/**
 * Get or create the Redis client singleton
 * Prevents multiple connections in serverless environments
 * @returns {Redis} Redis client instance
 */
export function getRedisClient() {
    if (!redisClient) {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            throw new Error(
                'Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env'
            );
        }

        redisClient = new Redis({
            url,
            token,
        });

        console.log('[Redis] Client initialized');
    }

    return redisClient;
}

/**
 * Key constants for Redis storage
 */
export const REDIS_KEYS = {
    CURRENT_KEY_INDEX: 'current_key_index',
    USAGE_PREFIX: 'usage:key_index_',
};

/**
 * Configuration constants
 */
export const ROTATION_CONFIG = {
    REQUESTS_PER_KEY: 20,
    COUNTER_TTL_SECONDS: 3600, // 1 hour TTL for old counters
};
