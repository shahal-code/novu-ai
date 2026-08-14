import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@shared/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('api/health')
  @ApiOperation({ summary: 'API Health check endpoint' })
  apiHealthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
