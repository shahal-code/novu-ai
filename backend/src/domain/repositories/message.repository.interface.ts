import { MessageEntity } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';

export interface IMessageRepository {
  findByConversationId(conversationId: string): Promise<MessageEntity[]>;
  create(conversationId: string, role: 'user' | 'assistant', content: string): Promise<MessageEntity>;
}
