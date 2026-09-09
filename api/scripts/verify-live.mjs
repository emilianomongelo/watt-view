#!/usr/bin/env node
/**
 * Zero-dependency live verification script.
 * Starts the server, tests key endpoints, then kills the server.
 *
 * Usage: node scripts/verify-live.mjs
 */

import { spawn } from 'node:child_process';

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;
const TIMEOUT = 30_000;
const POLL_INTERVAL = 500;

let serverProcess = null;

function log(label, ok) {
  console.log(`${ok ? 'ok' : 'FAIL'} ${label}`);
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT) {
    try {
      const res = await fetch(`${BASE}/api/status`);
      if (res.ok) return true;
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
  return false;
}

async function testEndpoint(label, path, validate) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      log(`${label} — HTTP ${res.status}`, false);
      return;
    }
    const body = await res.json();
    const ok = validate(body);
    log(label, ok);
    if (!ok) {
      console.log(`  unexpected body:`, JSON.stringify(body).slice(0, 200));
    }
  } catch (err) {
    log(`${label} — ${err.message}`, false);
  }
}

function killServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function main() {
  try {
    // Start server
    serverProcess = spawn('node', ['dist/main.js'], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    process.stdout.write(`Waiting for server on port ${PORT}...`);
    const ready = await waitForServer();
    if (!ready) {
      console.log(' TIMEOUT');
      process.exit(1);
    }
    console.log(' ready');

    // Test health
    await testEndpoint('GET /api/status', '/api/status', (b) => {
      return b && typeof b.timestamp === 'string';
    });

    // Test solar
    await testEndpoint('GET /api/solar/today', '/api/solar/today', (b) => {
      return b && typeof b.sunrise === 'string' && typeof b.sunset === 'string';
    });

    // Test weather (may fail if no network, but should return JSON)
    await testEndpoint('GET /api/weather/current', '/api/weather/current', (b) => {
      return b && typeof b.temperature === 'number';
    });
  } finally {
    killServer();
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  killServer();
  process.exit(1);
});
