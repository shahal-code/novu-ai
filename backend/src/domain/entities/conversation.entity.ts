export class ConversationEntity {
  id: string;
  userId: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<ConversationEntity>) {
    Object.assign(this, partial);
  }
}
