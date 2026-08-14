import { ConversationEntity } from '../entities/conversation.entity';

export const CONVERSATION_REPOSITORY = 'CONVERSATION_REPOSITORY';

export interface IConversationRepository {
  findByUserId(userId: string): Promise<ConversationEntity[]>;
  findByIdAndUser(id: string, userId: string): Promise<ConversationEntity | null>;
  create(userId: string, title: string): Promise<ConversationEntity>;
  rename(id: string, userId: string, title: string): Promise<ConversationEntity | null>;
  touch(id: string): Promise<void>;
}
