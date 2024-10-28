import redisService, { redis } from './redis.service';

/**
 * Service for caching using Redis
 *
 * @class CacheService
 * @property {function} set - Description placeholder
 * @property {function} get - Description placeholder
 * @property {function} delete - Description placeholder
 */
class CacheService {
  async set<T>(
    key: string,
    value: T,
    expiryInSeconds?: number,
  ): Promise<string> {
    // Set cache
    return await redis.setex(
      key,
      expiryInSeconds || 3600,
      JSON.stringify(value),
    );
  }

  async get<T>(key: string): Promise<T | null> {
    // Get cache
    const cache = await redis.get(key);

    // Parse cache
    const value = cache ? JSON.parse(cache) : null;

    return value;
  }

  async update<T>(key: string, value: T): Promise<string> {
    // Fetch cache
    const cache = await redis.get(key);

    // Check if cache exists. If not, set cache
    if (!cache) {
      return await redis.setex(key, 3600, JSON.stringify(value));
    }

    // Update cache
    return await redis.set(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<number> {
    // Delete cache
    return await redis.del(key);
  }
}

const cacheService = new CacheService();
export default cacheService;
