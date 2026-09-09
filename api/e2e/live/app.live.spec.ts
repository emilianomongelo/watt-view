import { describe, it, expect } from 'vitest';

const BASE = process.env.LIVE_BASE_URL ?? 'http://localhost:3000';

describe.skip('Live E2E (run with LIVE_E2E=1)', () => {
  it('health check', async () => {
    const res = await fetch(`${BASE}/api/health`);
    expect(res.ok).toBe(true);
  });

  it('solar today', async () => {
    const res = await fetch(`${BASE}/api/solar/today`);
    const body = await res.json();
    expect(body).toHaveProperty('sunrise');
  });
});
