import { MemoryEntity, MemoryFact } from '../entities/memory.entity';

export const MEMORY_REPOSITORY = 'MEMORY_REPOSITORY';

export interface IMemoryRepository {
  findByUserId(userId: string): Promise<MemoryEntity | null>;
  addFacts(userId: string, facts: MemoryFact[]): Promise<void>;
  deleteFact(userId: string, factId: string): Promise<void>;
  clearAll(userId: string): Promise<void>;
}
