import { REDIS_KEY_PREFIXES } from '#/api/v1/entities/enums/redis-keys.enums';
import envConfig from '#/common/config/env.config';
import ct from '#/common/constants';
import { asyncFnWrapper } from '#/common/utils/async-errors.util';
import { logger } from '#/common/utils/logger.util';
import { sanitizeParams } from '#/common/utils/sanitize.util';
import { Redis } from 'ioredis';

const { REDIS_URL } = envConfig;

class RedisService {
  private readonly redis: Redis;

  constructor() {
    // this.redis = new Redis(REDIS_URL);
    this.redis = new Redis(REDIS_URL);

    // Listen for the initial connect event
    this.redis.on('connect', () => {
      logger.info('[REDIS] :: Connected to Redis Database!');
    });

    // Listen for the error event
    this.redis.on('error', (err: any) => {
      logger.error('[REDIS] :: Redis connection error: ', err);

      if (this.isConnectionError(err)) {
        // Attempt to reconnect
        this.attemptReconnect();
      } else {
        // For other critical errors, disconnect and exit
        this.gracefulShutdown();
      }
    });
  }

  private isConnectionError(err: any): boolean {
    // Check for specific connection error codes or messages
    const connectionErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'];
    return connectionErrorCodes.includes(err.code);
  }

  private attemptReconnect() {
    // exponential backoff strategy for reconnection attempts
    const reconnectDelay = 5000; // 5 seconds
    setTimeout(() => {
      logger.info('[REDIS] :: Attempting to reconnect to Redis...');
      this.redis.connect().catch((err) => {
        logger.error('[REDIS] :: Redis reconnection failed: ', err);
        this.gracefulShutdown(); // If reconnection fails, perform shutdown
      });
    }, reconnectDelay);
  }

  private async gracefulShutdown() {
    try {
      logger.info('[REDIS] :: Initiating graceful shutdown...');

      // Perform any necessary cleanup here
      await this.redis.quit(); // Close Redis connection

      logger.info('[REDIS] :: Shutdown complete. Exiting process.');
      process.exit(0); // Exit the process successfully
    } catch (err) {
      logger.error('[REDIS] :: Error during graceful shutdown: ', err);
      process.exit(1); // Exit the process with failure
    }
  }

  getRedisClient(): Redis {
    return this.redis;
  }

  createKey(
    keyName: keyof typeof REDIS_KEY_PREFIXES,
    ...params: (string | number)[]
  ): string {
    // Convert the params array to strings properly
    const stringParams = params.map((param) => param?.toString());

    const prefix = REDIS_KEY_PREFIXES[keyName];

    if (!prefix) {
      throw new Error(`[REDIS] :: Invalid key name: ${keyName}`);
    }

    // Sanitize parameters to prevent injection attacks
    const sanitizedParams = sanitizeParams(stringParams);

    return `${prefix}::${sanitizedParams.join('::')}`;
  }

  createKeyPattern(
    keyName: keyof typeof REDIS_KEY_PREFIXES,
    ...params: (string | number)[]
  ): string {
    // Convert the params array to strings properly
    const stringParams = params.map((param) => param?.toString());

    const prefix = REDIS_KEY_PREFIXES[keyName];

    if (!prefix) {
      throw new Error(`[REDIS] :: Invalid key name: ${keyName}`);
    }

    // here we don't sanitize the parameters
    return `${prefix}::${stringParams.join('::')}`;
  }

  async ping() {
    return await this.redis.ping();
  }

  async setHashMapWithExpiry(
    key: string,
    seconds: number,
    values: Record<string, string>,
  ): Promise<'OK'> {
    return await this.redis.hmset(
      key,
      values,
      asyncFnWrapper(async (err, res) => {
        if (err) {
          throw new Error(err.message);
        }

        await this.redis.expire(key, seconds);
      }),
    );
  }

  async deleteKeysByPattern(pattern: string): Promise<void> {
    // this is a non-blocking operation, so use this instead of KEYS
    let cursor = '0';
    do {
      // SCAN through keys matching the pattern
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100', // Limit to 100 keys per iteration
      );
      cursor = nextCursor;

      // If there are keys found, delete them
      if (keys.length > 1) {
        // Delete the keys in bulk
        await this.redis.del(...keys);
      } else if (keys.length === 1) {
        // Delete the single key
        await this.redis.del(keys[0]);
      }
    } while (cursor !== '0');
  }
}

const redisService = new RedisService();
export const redis = redisService.getRedisClient();

export default redisService;
