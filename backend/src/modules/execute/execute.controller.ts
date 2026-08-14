import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ExecuteService } from './services/execute.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@ApiTags('Execute')
@ApiBearerAuth()
@Controller('api/execute')
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @Get('runtimes')
  @ApiOperation({ summary: 'Get list of supported code execution runtimes' })
  async getRuntimes() {
    return this.executeService.getRuntimes();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute code snippet via Piston API sandbox' })
  async executeCode(@Body() dto: ExecuteCodeDto) {
    return this.executeService.executeCode(dto);
  }
}
