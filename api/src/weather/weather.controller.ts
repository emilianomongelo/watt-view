import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import type { WeatherCurrent, WeatherForecast, WeatherDaily } from './weather.types';

@ApiTags('weather')
@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current weather conditions' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  async getCurrent(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): Promise<WeatherCurrent> {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.weatherService.getCurrent(latitude, longitude);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get hourly weather forecast' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getHourlyForecast(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('hours') hours?: string,
  ): Promise<WeatherForecast[]> {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.weatherService.getHourlyForecast(latitude, longitude, hours ? parseInt(hours, 10) : 24);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily weather forecast' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getDailyForecast(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('days') days?: string,
  ): Promise<WeatherDaily[]> {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.weatherService.getDailyForecast(latitude, longitude, days ? parseInt(days, 10) : 7);
  }
}
