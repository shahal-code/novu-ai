export class MessageEntity {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;

  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }
}
