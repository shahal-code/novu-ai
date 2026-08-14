import { Injectable, Inject } from '@nestjs/common';
import { CONVERSATION_REPOSITORY, IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { MESSAGE_REPOSITORY, IMessageRepository } from '@domain/repositories/message.repository.interface';
import { ConversationEntity } from '@domain/entities/conversation.entity';
import { MessageEntity } from '@domain/entities/message.entity';
import { NotFoundDomainException } from '@domain/exceptions/domain.exception';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { RenameConversationDto } from '../dto/rename-conversation.dto';
import { SaveMessageDto } from '../dto/save-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: IConversationRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: IMessageRepository,
  ) {}

  private normalizeConversation(conv: ConversationEntity) {
    return {
      id: conv.id,
      title: conv.title,
      created_at: conv.createdAt,
      updated_at: conv.updatedAt,
    };
  }

  private normalizeMessage(msg: MessageEntity) {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.createdAt,
    };
  }

  async listConversations(userId: string) {
    const conversations = await this.conversationRepository.findByUserId(userId);
    return conversations.map((conv) => this.normalizeConversation(conv));
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const conversation = await this.conversationRepository.create(userId, dto.title);
    return this.normalizeConversation(conversation);
  }

  async getConversationMessages(id: string, userId: string) {
    const conversation = await this.conversationRepository.findByIdAndUser(id, userId);
    if (!conversation) {
      throw new NotFoundDomainException('Conversation not found');
    }
    const messages = await this.messageRepository.findByConversationId(id);
    return messages.map((msg) => this.normalizeMessage(msg));
  }

  async renameConversation(id: string, userId: string, dto: RenameConversationDto) {
    const conversation = await this.conversationRepository.rename(id, userId, dto.title);
    if (!conversation) {
      throw new NotFoundDomainException('Conversation not found');
    }
    return this.normalizeConversation(conversation);
  }

  async saveConversationMessage(id: string, userId: string, dto: SaveMessageDto) {
    const conversation = await this.conversationRepository.findByIdAndUser(id, userId);
    if (!conversation) {
      throw new NotFoundDomainException('Conversation not found');
    }

    await this.conversationRepository.touch(id);
    const message = await this.messageRepository.create(id, dto.role, dto.content);
    return this.normalizeMessage(message);
  }
}
