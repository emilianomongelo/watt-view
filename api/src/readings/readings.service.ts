import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from './reading.entity';

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name);

  constructor(
    @InjectRepository(Reading)
    private readonly readingRepo: Repository<Reading>,
  ) {}

  async create(data: Partial<Reading>): Promise<Reading> {
    const reading = this.readingRepo.create(data);
    this.logger.debug('Saving reading', data);
    return this.readingRepo.save(reading);
  }

  async findAll(limit = 100): Promise<Reading[]> {
    return this.readingRepo.find({
      order: { recorded_at: 'DESC' },
      take: limit,
    });
  }

  async findLatest(): Promise<Reading | null> {
    return this.readingRepo.findOne({
      order: { recorded_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Reading | null> {
    return this.readingRepo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.readingRepo.delete(id);
  }
}
