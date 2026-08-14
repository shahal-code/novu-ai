import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailOtpEntity } from '@domain/entities/email-otp.entity';
import { IEmailOtpRepository } from '@domain/repositories/email-otp.repository.interface';
import { EmailOtp, EmailOtpDocument } from '../database/schemas/email-otp.schema';

@Injectable()
export class MongooseEmailOtpRepository implements IEmailOtpRepository {
  constructor(
    @InjectModel(EmailOtp.name) private readonly emailOtpModel: Model<EmailOtpDocument>,
  ) {}

  private mapToEntity(doc: EmailOtpDocument | null): EmailOtpEntity | null {
    if (!doc) return null;
    return new EmailOtpEntity({
      id: doc._id.toString(),
      email: doc.email,
      codeHash: doc.codeHash,
      attempts: doc.attempts,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<EmailOtpEntity | null> {
    const doc = await this.emailOtpModel.findOne({ email }).exec();
    return this.mapToEntity(doc);
  }

  async upsertOtp(email: string, codeHash: string, expiresAt: Date): Promise<EmailOtpEntity> {
    const doc = await this.emailOtpModel.findOneAndUpdate(
      { email },
      { codeHash, attempts: 0, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
    return this.mapToEntity(doc);
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.emailOtpModel.updateOne({ _id: id }, { $inc: { attempts: 1 } }).exec();
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.emailOtpModel.deleteOne({ email }).exec();
  }
}
