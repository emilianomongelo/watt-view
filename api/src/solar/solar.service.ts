import { Injectable } from '@nestjs/common';
import * as SunCalc from 'suncalc';
import type {
  SolarTimes,
  SolarPosition,
  SunPathPoint,
  SolarDaySummary,
} from './solar.types';

@Injectable()
export class SolarService {
  /**
   * Get all solar event times for a given date and location.
   */
  getSolarTimes(lat: number, lng: number, date: Date): SolarTimes {
    const times = SunCalc.getTimes(date, lat, lng);
    return {
      sunrise: times.sunrise,
      sunset: times.sunset,
      dawn: times.dawn,
      dusk: times.dusk,
      solarNoon: times.solarNoon,
      nightEnd: times.nightEnd,
      night: times.night,
      goldenHourEnd: times.goldenHourEnd,
      goldenHour: times.goldenHour,
    };
  }

  /**
   * Get the sun's azimuth and altitude at a specific moment.
   */
  getPosition(date: Date, lat: number, lng: number): SolarPosition {
    const pos = SunCalc.getPosition(date, lat, lng);
    return {
      azimuth: pos.azimuth,
      altitude: pos.altitude,
    };
  }

  /**
   * Compute the sun's path as azimuth/altitude at 30-minute intervals
   * from dawn to dusk.
   */
  getDailySunPath(lat: number, lng: number, date: Date): SunPathPoint[] {
    const times = this.getSolarTimes(lat, lng, date);
    const path: SunPathPoint[] = [];

    // Fall back to sunrise/sunset if dawn/dusk are null (polar edge cases)
    const startTime = (times.dawn ?? times.sunrise);
    const endTime = (times.dusk ?? times.sunset);
    if (!startTime || !endTime) return path;
    const start = startTime.getTime();
    const end = endTime.getTime();
    const interval = 30 * 60 * 1000; // 30 minutes

    for (let t = start; t <= end; t += interval) {
      const current = new Date(t);
      const pos = this.getPosition(current, lat, lng);
      path.push({
        time: current,
        azimuth: pos.azimuth,
        altitude: pos.altitude,
      });
    }

    return path;
  }

  /**
   * Calculate total daylight hours for a given day.
   */
  getDaylightHours(lat: number, lng: number, date: Date): number {
    const times = this.getSolarTimes(lat, lng, date);
    if (!times.sunrise || !times.sunset) return 0;
    const diff = times.sunset.getTime() - times.sunrise.getTime();
    return diff / (1000 * 60 * 60);
  }

  /**
   * Get a human-readable solar summary for a day.
   */
  getDaySummary(lat: number, lng: number, date: Date): SolarDaySummary {
    const times = this.getSolarTimes(lat, lng, date);
    const daylight = this.getDaylightHours(lat, lng, date);

    const toIso = (d: Date | null): string => d?.toISOString() ?? '';

    return {
      latitude: lat,
      longitude: lng,
      date: date.toISOString().slice(0, 10),
      sunrise: toIso(times.sunrise),
      sunset: toIso(times.sunset),
      daylightHours: Math.round(daylight * 100) / 100,
      solarNoon: times.solarNoon.toISOString(),
    };
  }
}
