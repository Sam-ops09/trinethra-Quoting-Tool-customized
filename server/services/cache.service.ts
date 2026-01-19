import { createClient, RedisClientType } from "redis";
import { LRUCache } from "lru-cache";
import { logger } from "../utils/logger";

class CacheService {
  private redisClient: RedisClientType | null = null;
  private memoryCache: LRUCache<string, any>;
  private useRedis: boolean = false;
  private isConnected: boolean = false;

  constructor() {
    // Initialize in-memory cache as fallback
    this.memoryCache = new LRUCache({
      max: 500, // Maximum number of items
      ttl: 1000 * 60 * 60, // 1 hour default TTL
    });

    if (process.env.REDIS_URL) {
      this.initRedis();
    } else {
      logger.info("Local: Cache service initialized with in-memory storage (No REDIS_URL provided)");
    }
  }

  private async initRedis() {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      this.redisClient.on("error", (err) => {
        logger.error("Redis Client Error", err);
        this.useRedis = false;
        this.isConnected = false;
      });

      this.redisClient.on("connect", () => {
        logger.info("Redis: Connected to Redis server");
        this.useRedis = true;
        this.isConnected = true;
      });

      this.redisClient.on("reconnecting", () => {
        logger.info("Redis: Reconnecting...");
        this.useRedis = false;
        this.isConnected = false;
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.error("Failed to connect to Redis, falling back to memory cache:", error);
      this.useRedis = false;
      this.isConnected = false;
    }
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.isConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
        return null;
      } else {
        return (this.memoryCache.get(key) as T) || null;
      }
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttlSeconds Time to live in seconds
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      if (this.useRedis && this.isConnected && this.redisClient) {
        await this.redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds,
        });
      } else {
        this.memoryCache.set(key, value, { ttl: ttlSeconds * 1000 });
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      if (this.useRedis && this.isConnected && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Flush all keys from the cache
   */
  async flush(): Promise<void> {
    try {
      if (this.useRedis && this.isConnected && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      logger.error("Cache flush error:", error);
    }
  }
}

export const cacheService = new CacheService();
