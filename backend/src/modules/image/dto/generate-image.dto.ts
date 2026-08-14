import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateImageDto {
  @ApiProperty({ example: 'A futuristic city at sunset, digital art style' })
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  prompt: string;
}
