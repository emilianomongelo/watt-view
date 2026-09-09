import { describe, it, expect, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiTokenGuard } from './auth.guard';

function createMockContext(authHeader?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authHeader ? { authorization: authHeader } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('ApiTokenGuard', () => {
  let guard: ApiTokenGuard;

  function makeGuard(tokenValue: string | undefined) {
    return new ApiTokenGuard({
      get: vi.fn((key: string) => (key === 'API_TOKEN' ? tokenValue : undefined)),
    } as never);
  }

  it('allows all requests when API_TOKEN is empty string', () => {
    guard = makeGuard('');
    const result = guard.canActivate(createMockContext());
    expect(result).toBe(true);
  });

  it('allows all requests when API_TOKEN is undefined', () => {
    guard = makeGuard(undefined);
    const result = guard.canActivate(createMockContext());
    expect(result).toBe(true);
  });

  it('allows request with correct Bearer token', () => {
    guard = makeGuard('test-token-123');
    const result = guard.canActivate(createMockContext('Bearer test-token-123'));
    expect(result).toBe(true);
  });

  it('throws when Authorization header is missing', () => {
    guard = makeGuard('test-token-123');
    expect(() => guard.canActivate(createMockContext())).toThrow(UnauthorizedException);
  });

  it('throws when Authorization header does not start with Bearer', () => {
    guard = makeGuard('test-token-123');
    expect(() =>
      guard.canActivate(createMockContext('Basic test-token-123')),
    ).toThrow(UnauthorizedException);
  });

  it('throws when token is incorrect', () => {
    guard = makeGuard('test-token-123');
    expect(() =>
      guard.canActivate(createMockContext('Bearer wrong-token')),
    ).toThrow(UnauthorizedException);
  });
});
