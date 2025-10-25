import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  LoginRequestDto,
  LoginResponseDto,
  PayloadUser,
} from './dto/login-dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { HashingService } from 'src/utils/services/hashing.service';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 5 * 1000; //5 seconds

  /** Utility to clear all session-related cookies */
  private clearSessionCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = isProd ? 'none' : 'lax';
    // res.clearCookie('sessionId', { httpOnly: true, secure: isProd, sameSite });
    res.clearCookie(process.env.TOKEN_NAME ?? '_auth_token_', {
      httpOnly: true,
      secure: isProd,
      sameSite,
    });
    // res.clearCookie(process.env.PASSKEY_TOKEN_NAME ?? '_passkey_token_', {
    //   httpOnly: true,
    //   secure: isProd,
    //   sameSite,
    // });
    // res.clearCookie('XSRF-TOKEN', {
    //   httpOnly: false,
    //   secure: isProd,
    //   sameSite,
    // });
  }

  /** Parse "10m", "30d" → ms */
  private parseExpiration(exp: string): number {
    const unit = exp.slice(-1);
    const value = parseInt(exp.slice(0, -1));
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid expiration format');
    }
  }

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  /** Authentication / Sign-In */
  async authenticate(
    email: string,
    password: string,
    res: Response,
  ): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: email.trim().toLocaleLowerCase() },
    });

    // user info checking
    if (!user)
      throw new NotFoundException('Account not Found or Deactivated. ');

    // lockout checking if user is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new ForbiddenException(
        `Account locked. Try again later. ${user.lockoutUntil},`,
      );
    }

    // checking if user can login again
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      user.lockoutUntil = null;
      user.failedAttempts = 0;
      await this.userRepository.save(user);
    }

    // verification of password
    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
        await this.userRepository.save(user);
        throw new ForbiddenException(
          `Too many failed attempts. locked until ${user.lockoutUntil}`,
        );
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    //failed attempts on success
    user.failedAttempts = 0;
    user.lockoutUntil = null;
    await this.userRepository.save(user);

    // sanitized user
    const { password: _, profileImage, ...rest } = user;
    const payloadUser: PayloadUser = rest;

    // generate tokens
    const accessToken = await this.jwtService.signAsync(payloadUser, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRATION as any,
    });

    const refreshToken = await this.jwtService.signAsync(payloadUser, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRATION as any,
    });

    const tokenName = process.env.TOKEN_NAME ?? '_auth_token_';
    const refreshExp = process.env.REFRESH_EXPIRATION ?? '30d';

    // res.cookie(tokenName, refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge: this.parseExpiration(refreshExp),
    // });

    const successMessage = `Login successful. Welcome back, ${user.fullname}!`;

    return {
      accessToken, // 10 mins
      refreshToken, //30 days
      message: successMessage,
      user: {
        ...payloadUser,
        profileImage,
      },
    };
  }
}
