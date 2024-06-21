import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [CacheController],
  providers: [CacheService],
})
export class RedisCacheModule {}
