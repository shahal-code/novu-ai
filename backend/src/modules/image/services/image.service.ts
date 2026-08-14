import { Injectable, BadRequestException } from '@nestjs/common';
import fetch from 'node-fetch';
import { GenerateImageDto } from '../dto/generate-image.dto';

@Injectable()
export class ImageService {
  async generateImage(dto: GenerateImageDto) {
    const prompt = dto.prompt.trim();
    if (!prompt) {
      throw new BadRequestException('prompt is required');
    }

    const seed = Math.floor(Math.random() * 1000000);
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&seed=${seed}&model=flux&nologo=true`;

    const check = await fetch(imageUrl, { method: 'HEAD' });
    if (!check.ok) {
      throw new BadRequestException('Image generation service unavailable');
    }

    return {
      url: imageUrl,
      prompt,
      seed,
    };
  }
}
