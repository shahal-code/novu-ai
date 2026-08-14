import { Injectable, BadRequestException } from '@nestjs/common';
import fetch from 'node-fetch';
import { ExecuteCodeDto } from '../dto/execute-code.dto';

export const PISTON_URL = 'https://emkc.org/api/v2/piston';

@Injectable()
export class ExecuteService {
  async getRuntimes() {
    const resp = await fetch(`${PISTON_URL}/runtimes`);
    if (!resp.ok) {
      throw new BadRequestException('Failed to fetch runtimes from Piston API');
    }
    return await resp.json();
  }

  async executeCode(dto: ExecuteCodeDto) {
    const payload = {
      language: dto.language,
      version: dto.version || '*',
      files: [{ content: dto.code }],
      stdin: dto.stdin || '',
      args: [],
      run_timeout: 5000,
      compile_timeout: 10000,
    };

    const resp = await fetch(`${PISTON_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new BadRequestException('Failed to execute code via Piston API');
    }

    const result: any = await resp.json();
    return {
      language: result.language,
      version: result.version,
      stdout: result.run?.stdout ?? '',
      stderr: result.run?.stderr ?? '',
      code: result.run?.code ?? 0,
      signal: result.run?.signal ?? null,
    };
  }
}
