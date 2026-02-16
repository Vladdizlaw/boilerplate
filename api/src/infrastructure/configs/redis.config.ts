import { registerAs } from '@nestjs/config';

const config = {
  type: 'single',
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
};
export const redisConfig = registerAs('redis', () => config);
