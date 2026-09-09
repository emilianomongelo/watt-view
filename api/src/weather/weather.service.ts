import { Injectable, Logger } from '@nestjs/common';
import type { WeatherCurrent, WeatherForecast, WeatherDaily } from './weather.types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  /**
   * Fetch current weather from Open-Meteo.
   */
  async getCurrent(lat: number, lng: number): Promise<WeatherCurrent> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code',
      timezone: 'auto',
    });

    this.logger.debug(`Fetching current weather: ${OPEN_METEO_BASE}?${params}`);

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    const current = data.current;

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      timestamp: new Date(current.time),
    };
  }

  /**
   * Fetch hourly forecast from Open-Meteo.
   */
  async getHourlyForecast(lat: number, lng: number, hours = 24): Promise<WeatherForecast[]> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability,shortwave_radiation,direct_normal_irradiance,diffuse_radiation,cloud_cover',
      forecast_hours: String(hours),
      timezone: 'auto',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    const hourly = data.hourly;

    const result: WeatherForecast[] = [];
    for (let i = 0; i < hourly.time.length; i++) {
      result.push({
        time: new Date(hourly.time[i]),
        temperature: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        windSpeed: hourly.wind_speed_10m[i],
        weatherCode: hourly.weather_code[i],
        precipitationProbability: hourly.precipitation_probability[i],
        ghi: hourly.shortwave_radiation?.[i] ?? 0,
        dni: hourly.direct_normal_irradiance?.[i] ?? 0,
        dhi: hourly.diffuse_radiation?.[i] ?? 0,
        cloudCover: hourly.cloud_cover?.[i] ?? 0,
      });
    }

    return result;
  }

  /**
   * Fetch daily forecast from Open-Meteo.
   */
  async getDailyForecast(lat: number, lng: number, days = 7): Promise<WeatherDaily[]> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code',
      forecast_days: String(days),
      timezone: 'auto',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await res.json()) as any;
    const daily = data.daily;

    const result: WeatherDaily[] = [];
    for (let i = 0; i < daily.time.length; i++) {
      result.push({
        date: daily.time[i],
        temperatureMax: daily.temperature_2m_max[i],
        temperatureMin: daily.temperature_2m_min[i],
        precipitationSum: daily.precipitation_sum[i],
        precipitationProbability: daily.precipitation_probability_max[i],
        windSpeedMax: daily.wind_speed_10m_max[i],
        weatherCode: daily.weather_code[i],
      });
    }

    return result;
  }
}
