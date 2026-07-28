import fetch from 'node-fetch';

const PISTON_URL = 'https://emkc.org/api/v2/piston';

export async function getRuntimes() {
  const resp = await fetch(`${PISTON_URL}/runtimes`);
  if (!resp.ok) {
    throw new Error('Failed to fetch runtimes from Piston API');
  }
  return await resp.json();
}

export async function executeCode(language, code, stdin = '', version = '*') {
  const payload = {
    language,
    version,
    files: [{ content: code }],
    stdin,
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
    throw new Error('Failed to execute code via Piston API');
  }

  const result = await resp.json();
  return {
    language: result.language,
    version: result.version,
    stdout: result.run?.stdout ?? '',
    stderr: result.run?.stderr ?? '',
    code: result.run?.code ?? 0,
    signal: result.run?.signal ?? null,
  };
}
