import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusService } from './status.service';

describe('StatusService', () => {
  let service: StatusService;

  beforeEach(() => {
    service = new StatusService(
      { login: vi.fn(), getPlantList: vi.fn(), getPlantInfo: vi.fn(), getInverterData: vi.fn() } as never,
      {
        getSolarTimes: vi.fn(),
        getPosition: vi.fn(),
        getDailySunPath: vi.fn(),
        getDaylightHours: vi.fn(),
        getDaySummary: vi.fn().mockReturnValue({
          latitude: -34.55,
          longitude: -68.3,
          date: '2025-06-21',
          sunrise: '2025-06-21T10:00:00Z',
          sunset: '2025-06-21T23:00:00Z',
          daylightHours: 10.5,
          solarNoon: '2025-06-21T16:30:00Z',
        }),
      } as never,
      {
        getCurrent: vi.fn().mockResolvedValue({
          temperature: 20,
          humidity: 50,
          windSpeed: 10,
          windDirection: 180,
          cloudCover: 20,
          precipitation: 0,
          weatherCode: 0,
          timestamp: new Date(),
        }),
        getHourlyForecast: vi.fn(),
        getDailyForecast: vi.fn(),
      } as never,
    );
  });

  it('returns system status with all sections', async () => {
    const status = await service.getStatus();

    expect(status.timestamp).toBeDefined();
    expect(status.solar).toBeDefined();
    expect(status.solar?.date).toBe('2025-06-21');
    expect(status.weather).toBeDefined();
    expect(status.weather?.temperature).toBe(20);
    expect(status.growatt.status).toBe('stub');
    expect(typeof status.uptime).toBe('number');
  });
});
