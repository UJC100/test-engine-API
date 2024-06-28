import { CacheService } from "src/cache/cache.service"



export const getCachedQuiz = async (
    redisCache: CacheService,
    key: string) => {
    const cachedQuiz = await redisCache.getCache(key)
    if (cachedQuiz) {
      return cachedQuiz
    }
  }

 