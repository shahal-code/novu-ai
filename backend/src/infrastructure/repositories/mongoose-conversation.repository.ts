import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationEntity } from '@domain/entities/conversation.entity';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { Conversation, ConversationDocument } from '../database/schemas/conversation.schema';

@Injectable()
export class MongooseConversationRepository implements IConversationRepository {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  private mapToEntity(doc: ConversationDocument | null): ConversationEntity | null {
    if (!doc) return null;
    return new ConversationEntity({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<ConversationEntity[]> {
    const docs = await this.conversationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByIdAndUser(id: string, userId: string): Promise<ConversationEntity | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    const doc = await this.conversationModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();
    return this.mapToEntity(doc);
  }

  async create(userId: string, title: string): Promise<ConversationEntity> {
    const truncatedTitle = title.length > 50 ? `${title.slice(0, 47)}…` : title;
    const created = await this.conversationModel.create({
      userId: new Types.ObjectId(userId),
      title: truncatedTitle,
    });
    return this.mapToEntity(created);
  }

  async rename(id: string, userId: string, title: string): Promise<ConversationEntity | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    const truncatedTitle = title.length > 50 ? `${title.slice(0, 47)}…` : title;
    const updated = await this.conversationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { title: truncatedTitle, updatedAt: new Date() },
      { new: true },
    ).exec();
    return this.mapToEntity(updated);
  }

  async touch(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.conversationModel.updateOne({ _id: new Types.ObjectId(id) }, { updatedAt: new Date() }).exec();
  }
}
