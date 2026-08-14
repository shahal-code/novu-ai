import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ConversationsService } from './services/conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
import { SaveMessageDto } from './dto/save-message.dto';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('api/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user conversations' })
  async listConversations(@CurrentUser('userId') userId: string) {
    return this.conversationsService.listConversations(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(userId, dto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getConversationMessages(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.conversationsService.getConversationMessages(id, userId);
  }

  @Put(':id')
  @Patch(':id')
  @ApiOperation({ summary: 'Rename a conversation' })
  async renameConversation(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: RenameConversationDto,
  ) {
    return this.conversationsService.renameConversation(id, userId, dto);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a message in a conversation' })
  async saveConversationMessage(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: SaveMessageDto,
  ) {
    return this.conversationsService.saveConversationMessage(id, userId, dto);
  }
}
