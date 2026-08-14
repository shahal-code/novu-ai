import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 'My AI Chat Session', description: 'Title of the conversation' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
}
