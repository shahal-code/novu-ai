import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'Target email for OTP' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @IsNotEmpty()
  email: string;
}
