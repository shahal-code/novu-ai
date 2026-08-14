import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryDocument = Memory & Document;

@Schema()
export class FactItem {
  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

const FactItemSchema = SchemaFactory.createForClass(FactItem);

@Schema()
export class PreferenceItem {
  @Prop({ default: null })
  language?: string;

  @Prop({ default: null })
  responseStyle?: string;
}

const PreferenceItemSchema = SchemaFactory.createForClass(PreferenceItem);

@Schema({ timestamps: true })
export class Memory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [FactItemSchema], default: [] })
  facts: FactItem[];

  @Prop({ type: PreferenceItemSchema, default: {} })
  preferences: PreferenceItem;

  createdAt?: Date;
  updatedAt?: Date;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);
