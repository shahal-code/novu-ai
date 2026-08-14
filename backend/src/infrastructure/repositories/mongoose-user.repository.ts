import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private mapToEntity(doc: UserDocument | null): UserEntity | null {
    if (!doc) return null;
    return new UserEntity({
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      googleId: doc.googleId,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findById(id).exec();
    return this.mapToEntity(doc);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return this.mapToEntity(doc);
  }

  async findByGoogleIdOrEmail(googleId: string, email: string): Promise<UserEntity | null> {
    const query: any[] = [];
    if (googleId) query.push({ googleId });
    if (email) query.push({ email });

    if (query.length === 0) return null;

    const doc = await this.userModel.findOne({ $or: query }).exec();
    return this.mapToEntity(doc);
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const created = await this.userModel.create(userData);
    return this.mapToEntity(created);
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const updated = await this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return this.mapToEntity(updated);
  }
}
