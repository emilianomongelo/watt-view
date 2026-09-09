import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { ChildProcess } from 'node:child_process';

let serverProcess: ChildProcess | null = null;
const BASE_URL = 'http://localhost:3000';

async function waitForServer(url: string, timeoutMs = 15_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return true;
    } catch {
      // server not ready
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

describe.skip('E2E: App (requires running server)', () => {
  beforeAll(async () => {
    const { spawn } = await import('node:child_process');
    serverProcess = spawn('node', ['dist/main.js'], {
      env: { ...process.env, PORT: '3000', DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/growatt_plus_test' },
      stdio: 'ignore',
    });
    const ready = await waitForServer(BASE_URL);
    if (!ready) throw new Error('Server did not start in time');
  });

  afterAll(() => {
    serverProcess?.kill();
  });

  it('GET /api/status returns 200', async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('solar');
    expect(body).toHaveProperty('weather');
  });

  it('GET /api/solar/today returns sunrise/sunset', async () => {
    const res = await fetch(`${BASE_URL}/api/solar/today`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('sunrise');
    expect(body).toHaveProperty('sunset');
  });
});
