import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant'] })
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty({ example: 'Hello, what is the latest news today?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class StreamChatDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'Array of conversation messages' })
  @IsArray({ message: 'messages array required' })
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
