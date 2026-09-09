import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { GrowattService } from '../growatt/growatt.service';
import { Reading } from './reading.entity';

@ApiBearerAuth()
@ApiTags('readings')
@Controller('api/readings')
export class ReadingsController {
  constructor(
    private readonly readingsService: ReadingsService,
    @Inject(forwardRef(() => GrowattService))
    private readonly growattService: GrowattService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List recent readings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('limit') limit?: string): Promise<Reading[]> {
    return this.readingsService.findAll(limit ? parseInt(limit, 10) : 100);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get most recent reading' })
  async findLatest(): Promise<Reading | null> {
    return this.readingsService.findLatest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reading by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Reading | null> {
    return this.readingsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a reading' })
  async create(@Body() data: Partial<Reading>): Promise<Reading> {
    return this.readingsService.create(data);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import historical data from Growatt API' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO string). Default: 30 days ago',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO string). Default: now',
  })
  async importHistorical(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<{ imported: number; from: string; to: string }> {
    const endDate = to ? new Date(to) : new Date();
    const startDate = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const num = (v: unknown): number | null => {
      if (v === undefined || v === null || v === '') return null;
      const n = parseFloat(String(v));
      return Number.isFinite(n) ? n : null;
    };

    // Fetch from Growatt
    const historyRecords =
      await this.growattService.getHistoricalData(startDate, endDate);

    // Map to Reading entities
    const readings: Partial<Reading>[] = historyRecords.map((h) => ({
      recorded_at: this.parseCalendar(h.calendar),
      pv_power: num(h.ppv),
      battery_soc: num(h.capacity),
      battery_power: num(h.pBat),
      load_power: num(h.outPutPower),
      daily_yield: num(h.epvToday),
    }));

    // Upsert
    const count = await this.readingsService.upsertMany(readings);

    return {
      imported: count,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reading' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.readingsService.remove(id);
  }

  /**
   * Parse calendar value from Growatt history.
   * Could be an ISO string or a Unix timestamp in seconds.
   */
  private parseCalendar(value: string | number): Date {
    if (typeof value === 'number') {
      // Unix timestamp in seconds — convert to milliseconds
      return new Date(value * 1000);
    }
    return new Date(value);
  }
}
