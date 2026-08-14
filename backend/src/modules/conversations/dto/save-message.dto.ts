import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SaveMessageDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant'] })
  @IsString()
  @IsIn(['user', 'assistant'], { message: 'role and content required' })
  role: 'user' | 'assistant';

  @ApiProperty({ example: 'Hello, world!' })
  @IsString()
  @IsNotEmpty({ message: 'role and content required' })
  content: string;
}
