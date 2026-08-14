import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty({ example: '60d5ecf8b5c9c42a2c8e4b1a' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email?: string;

  @ApiProperty({ example: 'John Doe' })
  name?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ type: UserPayloadDto })
  user: UserPayloadDto;
}
