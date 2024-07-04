import { InjectRedis } from '@nestjs-modules/ioredis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, } from '@nestjs/common';
import { Cache } from 'cache-manager'
import Redis from 'ioredis'

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
  @InjectRedis() private readonly redis: Redis) { }

  setCache = async (key: string, value: object) => {
    return await this.cacheManager.set(key, value);
  };

  getCache = async (key: string) => {
    return await this.cacheManager.get(key);
  };

  delete = async (key: string) => {
    const stream =  this.redis.scanStream({
      match: `${key}`
    })

    stream.on('data', async(keys: string[]) => {
      if (keys.length > 0) {
        await this.redis.del(...keys)
         console.log(`Deleted keys: ${keys}`);
      }
    })

     stream.on('end', () => {
       console.log('Scan complete');
     });
  }
}
