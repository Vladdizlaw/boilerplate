import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CachingRedisService } from './redis-caching.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get('REDIS_PASSWORD');
        const encodedPassword = password ? encodeURIComponent(password) : '';
        return {
          type: 'single',
          url: `redis://:${encodedPassword}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
        };
      },
    }),
  ],
  providers: [CachingRedisService],
  exports: [NestRedisModule, CachingRedisService],
})
export class RedisModule {}
