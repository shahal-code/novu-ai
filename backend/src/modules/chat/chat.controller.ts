import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { ChatService } from './services/chat.service';
import { StreamChatDto } from './dto/chat.dto';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Stream AI chat completion response via SSE' })
  async streamChat(
    @CurrentUser('userId') userId: string,
    @Body() dto: StreamChatDto,
    @Res() res: Response,
  ) {
    return this.chatService.handleChatStream(userId, dto, res);
  }
}
