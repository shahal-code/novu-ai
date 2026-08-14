import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { MemoryService } from './services/memory.service';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Memory')
@ApiBearerAuth()
@Controller('api/memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get memories and preferences for current user' })
  async getMemory(@CurrentUser('userId') userId: string) {
    return this.memoryService.getUserMemory(userId);
  }

  @Delete(['facts/:factId', ':factId'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specific memory fact by ID' })
  async deleteFact(
    @CurrentUser('userId') userId: string,
    @Param('factId') factId: string,
  ) {
    return this.memoryService.deleteFact(userId, factId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all memories for current user' })
  async clearMemory(@CurrentUser('userId') userId: string) {
    return this.memoryService.clearAllMemory(userId);
  }
}
