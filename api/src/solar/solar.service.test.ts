import { describe, it, expect, beforeEach } from 'vitest';
import { SolarService } from './solar.service';

describe('SolarService', () => {
  let service: SolarService;

  beforeEach(() => {
    service = new SolarService();
  });

  describe('getSolarTimes', () => {
    it('returns valid solar times for Mendoza', () => {
      const date = new Date('2025-06-21T12:00:00Z');
      const times = service.getSolarTimes(-34.556960, -68.307736, date);

      expect(times.sunrise).toBeInstanceOf(Date);
      expect(times.sunset).toBeInstanceOf(Date);
      expect(times.solarNoon).toBeInstanceOf(Date);
      expect(times.sunrise!.getTime()).toBeGreaterThan(0);
      expect(times.sunset!.getTime()).toBeGreaterThan(times.sunrise!.getTime());
    });
  });

  describe('getPosition', () => {
    it('returns azimuth and altitude', () => {
      const date = new Date('2025-06-21T15:00:00Z');
      const pos = service.getPosition(date, -34.556960, -68.307736);

      expect(typeof pos.azimuth).toBe('number');
      expect(typeof pos.altitude).toBe('number');
    });
  });

  describe('getDaylightHours', () => {
    it('returns positive daylight hours', () => {
      const date = new Date('2025-06-21T12:00:00Z');
      const hours = service.getDaylightHours(-34.556960, -68.307736, date);

      expect(hours).toBeGreaterThan(0);
      expect(hours).toBeLessThan(24);
    });
  });

  describe('getDaySummary', () => {
    it('returns complete summary', () => {
      const date = new Date('2025-06-21T12:00:00Z');
      const summary = service.getDaySummary(-34.556960, -68.307736, date);

      expect(summary.latitude).toBe(-34.556960);
      expect(summary.longitude).toBe(-68.307736);
      expect(summary.date).toBe('2025-06-21');
      expect(typeof summary.sunrise).toBe('string');
      expect(typeof summary.sunset).toBe('string');
      expect(summary.daylightHours).toBeGreaterThan(0);
    });
  });

  describe('getDailySunPath', () => {
    it('returns array of sun path points', () => {
      const date = new Date('2025-06-21T12:00:00Z');
      const path = service.getDailySunPath(-34.556960, -68.307736, date);

      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toHaveProperty('time');
      expect(path[0]).toHaveProperty('azimuth');
      expect(path[0]).toHaveProperty('altitude');
    });
  });
});
