import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrowattService } from '../growatt/growatt.service';
import type { GrowattInverterData } from '../growatt/growatt.types';
import { SolarService } from '../solar/solar.service';
import { WeatherService } from '../weather/weather.service';
import type { SolarDaySummary } from '../solar/solar.types';
import type { WeatherCurrent } from '../weather/weather.types';

export interface SystemStatus {
  timestamp: string;
  solar: SolarDaySummary | null;
  weather: WeatherCurrent | null;
  growatt: {
    plantId: string;
    status: string;
    inverterData: GrowattInverterData | null;
  };
  uptime: number;
}

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly growattService: GrowattService,
    private readonly solarService: SolarService,
    private readonly weatherService: WeatherService,
  ) {}

  async getStatus(): Promise<SystemStatus> {
    const lat = this.configService.get<number>('SOLAR_LAT') ?? -34.55696;
    const lng = this.configService.get<number>('SOLAR_LON') ?? -68.30774;
    const plantId = this.configService.get<string>('GROWATT_PLANT_ID') ?? '';

    let solar: SolarDaySummary | null = null;
    let weather: WeatherCurrent | null = null;
    let inverterData: GrowattInverterData | null = null;

    try {
      solar = this.solarService.getDaySummary(lat, lng, new Date());
    } catch (error) {
      this.logger.warn('Failed to get solar data', error);
    }

    try {
      weather = await this.weatherService.getCurrent(lat, lng);
    } catch (error) {
      this.logger.warn('Failed to get weather data', error);
    }

    try {
      const result = await this.growattService.getPlantData();
      inverterData = result.inverterData;
    } catch (error) {
      this.logger.warn('Failed to get Growatt data', error);
    }

    return {
      timestamp: new Date().toISOString(),
      solar,
      weather,
      growatt: {
        plantId,
        status: inverterData ? 'connected' : 'error',
        inverterData,
      },
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
