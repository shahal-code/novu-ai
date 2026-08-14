import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExecuteCodeDto {
  @ApiProperty({ example: 'python', description: 'Target programming language' })
  @IsString()
  @IsNotEmpty({ message: 'language and code are required' })
  language: string;

  @ApiProperty({ example: 'print("Hello from Piston API!")', description: 'Source code to run' })
  @IsString()
  @IsNotEmpty({ message: 'language and code are required' })
  code: string;

  @ApiProperty({ example: '', required: false, description: 'Standard input string' })
  @IsString()
  @IsOptional()
  stdin?: string = '';

  @ApiProperty({ example: '*', required: false, description: 'Language runtime version' })
  @IsString()
  @IsOptional()
  version?: string = '*';
}
