import { Injectable, Inject } from '@nestjs/common';
import {Cache} from 'cache-manager'

@Injectable()
export class CacheService {
    constructor(@Inject('CACHE_MANAGER')private readonly cacheManager: Cache)
    { }

    async getStudent() {
        
    }
}
