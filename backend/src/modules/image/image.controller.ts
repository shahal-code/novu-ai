import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ImageService } from './services/image.service';
import { GenerateImageDto } from './dto/generate-image.dto';

@ApiTags('Image')
@ApiBearerAuth()
@Controller('api/image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate image using Pollinations AI' })
  async generateImage(@Body() dto: GenerateImageDto) {
    return this.imageService.generateImage(dto);
  }
}
