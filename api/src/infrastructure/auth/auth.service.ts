import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/domain/ports/user.repository.interface';
import { IUser } from 'src/domain/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { GoogleService } from '../integrations/google/google.service';
import { AttachmentRepository } from 'src/domain/ports/attachment.repository.interface';
import { ResourceEnum } from 'src/domain/interfaces/attachment.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleService: GoogleService,
    private readonly attachmentRepository: AttachmentRepository,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async validateUser(login: string, password: string): Promise<IUser | null> {
    const [user] = await this.userRepository.find({ email: login });
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return null;
    }
    return user;
  }

  async getMe(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async generateToken(user: IUser) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = await this.JwtService.sign(payload);
    return {
      access_token: newAccessToken, // jwt module is configured in auth.module.ts for access token
    };
  }

  async login(loginDto: { email: string; password: string }) {
    const [account] = await this.userRepository.find({
      email: loginDto.email,
    });
    if (!account) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordCorrect = await bcrypt.compareSync(
      loginDto.password,
      account.password_hash,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Bad password');
    }
    const token = await this.generateToken(account);
    await this.redisClient.set(
      `access_token:${account.id}`,
      token.access_token,
      'EX',
      this.configService.get('JWT_EXPIRATION_TIME'),
    );

    return token;
  }

  async oAuthLogin(code: string) {
    const user = await this.googleService.getAuthClientData(code);
    if (!user) {
      throw new Error('User not found');
    }
    console.log({ user });
    let [existingUser] = await this.userRepository.find({
      email: user.email,
    });
    if (!existingUser) {
      await this.userRepository.create({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        provider: 'google',
        provider_id: user.google_id,
        terms_and_conditions: true,
      });
      [existingUser] = await this.userRepository.find({ email: user.email });
      if (user.avatar_url) {
        await this.attachmentRepository.create({
          user_id: existingUser.id,
          original_file_name: 'google-avatar',
          file_type: 'image/jpeg',
          resource: ResourceEnum.USER,
          resource_id: existingUser.id,
          file_name: 'google-avatar',
          path: user.avatar_url,
        });
      }
    }
    if (existingUser.provider !== 'google') {
      throw new UnauthorizedException('User not found');
    }
    const token = await this.generateToken(existingUser);
    await this.redisClient.set(
      `access_token:${existingUser.id}`,
      token.access_token,
      'EX',
      this.configService.get('JWT_EXPIRATION_TIME'),
    );
    return token;
  }
}
