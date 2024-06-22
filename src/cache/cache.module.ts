import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { Module } from '@nestjs/common';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as redisStore from 'cache-manager-redis-store'
import {redisStore} from 'cache-manager-redis-yet'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 60 * 1000
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService]
})
export class RedisCacheModule {}
