import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, } from '@nestjs/common';
import {Cache} from 'cache-manager'

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache) {}

  setCache = async (key: string, value: object) => {
    return await this.cacheManager.set(key, value);
  };

  getCache = async (key: string) => {
    return await this.cacheManager.get(key);
  };
}
