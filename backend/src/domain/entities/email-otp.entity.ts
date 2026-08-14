export class EmailOtpEntity {
  id?: string;
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<EmailOtpEntity>) {
    Object.assign(this, partial);
  }
}
