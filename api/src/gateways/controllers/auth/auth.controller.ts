import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Public } from 'src/gateways/decorators/public.decorator';
import { Response, Request as ExpressRequest } from 'express';
import { LoginDto } from './dtos/login.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequestUser } from 'src/gateways/decorators/request-user.decorator';
// import { ResponseUser } from '../user/dtos/create-user.dto';
import { IUser } from 'src/domain/interfaces/user.interface';
import { CodeDto } from './dtos/code.dto';
import { BaseException } from 'src/infrastructure/exceptions/base-exception.exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Throttle({
    short: { limit: 20, ttl: 1000 },
    long: { limit: 50, ttl: 60000 },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      email: 'test1@test.com',
      password: 'test',
    },
    description: 'Login user',
  })
  @ApiBearerAuth()
  @SkipThrottle({ default: false })
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return this.authService.login(dto);
    } catch (err) {
      throw BaseException.fromError(err);
    }
  }

  @Public()
  @Post('google/callback')
  async googleAuthCallback(@Body() { code }: CodeDto) {
    try {
      console.log({ code });
      const token = await this.authService.oAuthLogin(code);
      return token;
    } catch (err) {
      throw BaseException.fromError(err);
    }
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiResponse({
    status: HttpStatus.OK,
    // type: ResponseUser,
    description: 'Get details of currently logged-in user',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getMe(
    @RequestUser() authUser: IUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.authService.getMe(authUser.id);
      res.header('Cache-Control', 'no-store');
      // return new ResponseUser(user);
      return user;
    } catch (err) {
      throw BaseException.fromError(err);
    }
  }
}
