import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailOtpDocument = EmailOtp & Document;

@Schema({ timestamps: true })
export class EmailOtp {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  codeHash: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EmailOtpSchema = SchemaFactory.createForClass(EmailOtp);
