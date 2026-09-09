export interface SolarTimes {
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  solarNoon: Date;
  nightEnd: Date | null;
  night: Date | null;
  goldenHourEnd: Date | null;
  goldenHour: Date | null;
}

export interface SolarPosition {
  azimuth: number;
  altitude: number;
}

export interface SunPathPoint {
  time: Date;
  azimuth: number;
  altitude: number;
}

export interface SolarDaySummary {
  latitude: number;
  longitude: number;
  date: string;
  sunrise: string;
  sunset: string;
  daylightHours: number;
  solarNoon: string;
}
