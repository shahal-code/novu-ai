import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '@shared/decorators/public.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post(['request-otp', 'email-otp/request'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email OTP code' })
  async requestEmailOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestEmailOtp(dto.email);
  }

  @Public()
  @Post(['verify-otp', 'email-otp/verify'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email OTP code and sign in' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async verifyEmailOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyEmailOtp(dto.email, dto.code);
  }

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth redirect' })
  googleRedirect(@Res() res: Response) {
    const url = this.authService.getGoogleRedirectUrl();
    return res.redirect(url);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.authService.handleGoogleCallback(state, code);
    return res.redirect(redirectUrl);
  }

  @Get(['me', 'profile'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of currently logged-in user' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }
}
