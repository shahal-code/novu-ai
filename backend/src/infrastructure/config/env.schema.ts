import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 5000;

  @IsString()
  MONGO_URI: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:5173';

  @IsString()
  @IsOptional()
  GROQ_API_KEY: string = '';

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  SMTP_URL?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT: number = 587;

  @IsOptional()
  SMTP_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM: string = '"NovuAI Dev" <test@novuai.app>';

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = '127.0.0.1';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;
}

export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
