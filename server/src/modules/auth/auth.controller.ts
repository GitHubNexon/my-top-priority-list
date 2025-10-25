import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request as NestRequest,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-dto';
import type { Response, Request as ExpressRequest } from 'express';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.authenticate(
      loginRequestDto.email,
      loginRequestDto.password,
      res,
    );
  }
}
