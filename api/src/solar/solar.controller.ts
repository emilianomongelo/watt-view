import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SolarService } from './solar.service';
import type {
  SolarTimes,
  SolarPosition,
  SunPathPoint,
  SolarDaySummary,
} from './solar.types';

@ApiTags('solar')
@Controller('api/solar')
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's solar times" })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getToday(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): SolarTimes {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.solarService.getSolarTimes(latitude, longitude, new Date());
  }

  @Get('position')
  @ApiOperation({ summary: 'Get current sun position' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getPosition(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): SolarPosition {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.solarService.getPosition(new Date(), latitude, longitude);
  }

  @Get('path')
  @ApiOperation({ summary: "Get today's sun path (30-min intervals)" })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getPath(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): SunPathPoint[] {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.solarService.getDailySunPath(latitude, longitude, new Date());
  }

  @Get('daylight')
  @ApiOperation({ summary: 'Get daylight hours for today' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getDaylight(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): { daylightHours: number } {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    const hours = this.solarService.getDaylightHours(latitude, longitude, new Date());
    return { daylightHours: Math.round(hours * 100) / 100 };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get day solar summary' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  getSummary(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): SolarDaySummary {
    const latitude = lat ? parseFloat(lat) : parseFloat(process.env.SOLAR_LAT ?? '-34.556960');
    const longitude = lng ? parseFloat(lng) : parseFloat(process.env.SOLAR_LON ?? '-68.307736');
    return this.solarService.getDaySummary(latitude, longitude, new Date());
  }
}
