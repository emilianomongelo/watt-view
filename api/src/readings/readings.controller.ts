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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { Reading } from './reading.entity';

@ApiBearerAuth()
@ApiTags('readings')
@Controller('api/readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reading' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.readingsService.remove(id);
  }
}
