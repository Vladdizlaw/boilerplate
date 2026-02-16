import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request as RequestType } from 'express';
import { UserRepository } from 'src/domain/ports/user.repository.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: UserRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (
      req.cookies &&
      'token' in req.cookies &&
      req.cookies.user_token.length > 0
    ) {
      return req.cookies.token;
    } else if (req?.query?.token) {
      return req.query.token as string;
    }
    return null;
  }

  async validate(payload: any) {
    const token = await this.redis.get(`access_token:${payload.sub}`);

    if (!token) {
      throw new UnauthorizedException();
    }

    const authUser = await this.accountService.findUser(payload.sub);

    if (!authUser) {
      throw new UnauthorizedException();
    }

    return authUser;
  }
}
