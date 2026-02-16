import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CachingRedisService } from 'src/infrastructure/database/redis/redis-caching.service';

@Injectable()
export class IdempotencyKeyInterceptor implements NestInterceptor {
  constructor(
    @Inject(CachingRedisService)
    private readonly cachingService: CachingRedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    let idempotencyKey = request.headers['x-idempotency-key'];
    const message = request.body;

    if (!idempotencyKey) {
      idempotencyKey = {
        ...message,
      };
    }

    await this.cachingService.checkAndSetLock(idempotencyKey).catch((error) => {
      throw new BadRequestException(error.message);
    });

    return next.handle();
    // .pipe(
    //   tap(async (data) => {
    //     await this.idempotencyRepository.update(idempotencyKey, data);
    //     return data;
    //   }),
    // );
  }
}
