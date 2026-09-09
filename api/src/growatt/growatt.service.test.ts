import { describe, it, expect, beforeEach } from 'vitest';
import { GrowattService } from './growatt.service';

describe('GrowattService', () => {
  let service: GrowattService;

  beforeEach(() => {
    service = new GrowattService();
  });

  it('login returns void', async () => {
    await expect(service.login()).resolves.toBeUndefined();
  });

  it('getPlantList returns array', async () => {
    const result = await service.getPlantList();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getPlantInfo returns object with plantId', async () => {
    const result = await service.getPlantInfo('test-123');
    expect(result.plantId).toBe('test-123');
    expect(typeof result.capacity).toBe('number');
  });

  it('getInverterData returns object with numeric fields', async () => {
    const result = await service.getInverterData('test-123');
    expect(typeof result.pvPower).toBe('number');
    expect(typeof result.batterySoc).toBe('number');
    expect(result.recordedAt).toBeInstanceOf(Date);
  });
});
