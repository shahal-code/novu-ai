export interface MemoryFact {
  id?: string;
  text: string;
  createdAt?: Date;
}

export interface MemoryPreferences {
  language?: string;
  responseStyle?: string;
}

export class MemoryEntity {
  id: string;
  userId: string;
  facts: MemoryFact[];
  preferences?: MemoryPreferences;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<MemoryEntity>) {
    Object.assign(this, partial);
  }
}
