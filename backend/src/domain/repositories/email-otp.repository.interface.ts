import { EmailOtpEntity } from '../entities/email-otp.entity';

export const EMAIL_OTP_REPOSITORY = 'EMAIL_OTP_REPOSITORY';

export interface IEmailOtpRepository {
  findByEmail(email: string): Promise<EmailOtpEntity | null>;
  upsertOtp(email: string, codeHash: string, expiresAt: Date): Promise<EmailOtpEntity>;
  incrementAttempts(id: string): Promise<void>;
  deleteByEmail(email: string): Promise<void>;
}
