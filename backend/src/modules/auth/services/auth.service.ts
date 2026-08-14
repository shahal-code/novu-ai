import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import fetch from 'node-fetch';

import { USER_REPOSITORY, IUserRepository } from '@domain/repositories/user.repository.interface';
import { EMAIL_OTP_REPOSITORY, IEmailOtpRepository } from '@domain/repositories/email-otp.repository.interface';
import { UserEntity } from '@domain/entities/user.entity';
import {
  BadRequestDomainException,
  ConflictDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
} from '@domain/exceptions/domain.exception';

import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(EMAIL_OTP_REPOSITORY) private readonly emailOtpRepository: IEmailOtpRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  userPayload(user: UserEntity) {
    return { id: user.id, email: user.email, name: user.name };
  }

  buildAuthResponse(user: UserEntity): AuthResponseDto {
    return {
      token: this.signToken(user.id),
      user: this.userPayload(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(email);

    if (existing?.passwordHash) {
      throw new ConflictDomainException('An account already uses this email. Sign in instead.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user: UserEntity;

    if (existing) {
      user = await this.userRepository.update(existing.id, { passwordHash });
    } else {
      user = await this.userRepository.create({ email, passwordHash });
    }

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user?.passwordHash) {
      throw new UnauthorizedDomainException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedDomainException('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  private async getMailer() {
    const smtpUrl = this.configService.get<string>('SMTP_URL');
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (smtpUrl) return nodemailer.createTransport(smtpUrl);
    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    }

    this.logger.log('No SMTP credentials found. Falling back to Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  async requestEmailOtp(emailInput: string): Promise<{ message: string }> {
    const email = emailInput.trim().toLowerCase();
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.emailOtpRepository.upsertOtp(email, codeHash, expiresAt);

    this.logger.log(`🔑 DEV OTP CODE FOR ${email}: ${code}`);

    try {
      const mailer = await this.getMailer();
      const info = await mailer.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || '"NovuAI Dev" <test@novuai.app>',
        to: email,
        subject: 'Your NovuAI verification code',
        text: `Your NovuAI verification code is ${code}. It expires in 10 minutes.`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 Ethereal Email Preview URL: ${previewUrl}`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not send verification email: ${err.message}`);
    }

    return { message: 'Verification code sent.' };
  }

  async verifyEmailOtp(emailInput: string, codeInput: string): Promise<AuthResponseDto> {
    const email = emailInput.trim().toLowerCase();
    const code = codeInput.trim();
    const record = await this.emailOtpRepository.findByEmail(email);

    if (!record || record.expiresAt < new Date() || record.attempts >= 5) {
      throw new BadRequestDomainException('This code is invalid or expired. Request a new one.');
    }

    const isValid = await bcrypt.compare(code, record.codeHash);
    if (!isValid) {
      if (record.id) {
        await this.emailOtpRepository.incrementAttempts(record.id);
      }
      throw new BadRequestDomainException('That verification code is incorrect.');
    }

    await this.emailOtpRepository.deleteByEmail(email);
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.userRepository.create({ email });
    }

    return this.buildAuthResponse(user);
  }

  getGoogleRedirectUrl(): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new BadRequestDomainException('Google sign-in is not configured.');
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const signedState = this.jwtService.sign(
      { purpose: 'google-oauth', nonce },
      { expiresIn: '10m' },
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state: signedState,
      prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleGoogleCallback(state: string, code: string): Promise<string> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    try {
      const decodedState = this.jwtService.verify(state);
      if (decodedState.purpose !== 'google-oauth' || !code) {
        throw new Error('Invalid OAuth response');
      }

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');

      const tokenReply = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData: any = await tokenReply.json();
      if (!tokenReply.ok) throw new Error(tokenData.error || 'Google token exchange failed');

      const profileReply = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profile: any = await profileReply.json();
      if (!profileReply.ok || !profile.email_verified || !profile.email) {
        throw new Error('Google did not provide a verified email');
      }

      const normalizedEmail = profile.email.toLowerCase();
      let user = await this.userRepository.findByGoogleIdOrEmail(profile.sub, normalizedEmail);

      if (!user) {
        user = await this.userRepository.create({
          email: normalizedEmail,
          googleId: profile.sub,
          name: profile.name,
        });
      } else if (!user.googleId) {
        user = await this.userRepository.update(user.id, {
          googleId: profile.sub,
          name: user.name || profile.name,
        });
      }

      const token = this.signToken(user.id);
      return `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;
    } catch (err: any) {
      this.logger.error(`Google OAuth error: ${err.message}`);
      return `${frontendUrl}/?auth_error=${encodeURIComponent('Google sign-in could not be completed.')}`;
    }
  }

  async getProfile(userId: string): Promise<{ user: ReturnType<AuthService['userPayload']> }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainException('User not found');
    }
    return { user: this.userPayload(user) };
  }
}
