import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MemoryEntity, MemoryFact } from '@domain/entities/memory.entity';
import { IMemoryRepository } from '@domain/repositories/memory.repository.interface';
import { Memory, MemoryDocument } from '../database/schemas/memory.schema';

@Injectable()
export class MongooseMemoryRepository implements IMemoryRepository {
  constructor(
    @InjectModel(Memory.name) private readonly memoryModel: Model<MemoryDocument>,
  ) {}

  private mapToEntity(doc: MemoryDocument | null): MemoryEntity | null {
    if (!doc) return null;
    return new MemoryEntity({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      facts: doc.facts.map((f: any) => ({
        id: f._id ? f._id.toString() : undefined,
        text: f.text,
        createdAt: f.createdAt,
      })),
      preferences: {
        language: doc.preferences?.language,
        responseStyle: doc.preferences?.responseStyle,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<MemoryEntity | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    const doc = await this.memoryModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    return this.mapToEntity(doc);
  }

  async addFacts(userId: string, newFacts: MemoryFact[]): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !newFacts.length) return;
    await this.memoryModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $push: { facts: { $each: newFacts, $slice: -50 } },
      },
      { upsert: true, new: true },
    ).exec();
  }

  async deleteFact(userId: string, factId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(factId)) return;
    await this.memoryModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { facts: { _id: new Types.ObjectId(factId) } } },
    ).exec();
  }

  async clearAll(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) return;
    await this.memoryModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { facts: [] } },
    ).exec();
  }
}
