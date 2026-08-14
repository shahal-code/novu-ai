import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameConversationDto {
  @ApiProperty({ example: 'Updated Chat Title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
}
