import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageEntity } from '@domain/entities/message.entity';
import { IMessageRepository } from '@domain/repositories/message.repository.interface';
import { Message, MessageDocument } from '../database/schemas/message.schema';

@Injectable()
export class MongooseMessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  private mapToEntity(doc: MessageDocument | null): MessageEntity | null {
    if (!doc) return null;
    return new MessageEntity({
      id: doc._id.toString(),
      conversationId: doc.conversationId.toString(),
      role: doc.role as 'user' | 'assistant',
      content: doc.content,
      createdAt: doc.createdAt,
    });
  }

  async findByConversationId(conversationId: string): Promise<MessageEntity[]> {
    if (!Types.ObjectId.isValid(conversationId)) return [];
    const docs = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .exec();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async create(conversationId: string, role: 'user' | 'assistant', content: string): Promise<MessageEntity> {
    const created = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      role,
      content,
    });
    return this.mapToEntity(created);
  }
}
