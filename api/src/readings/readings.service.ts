import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from './reading.entity';

@Injectable()
export class ReadingsService {
  private static readonly UPSERT_COLUMNS = [
    'battery_soc',
    'battery_power',
    'pv_power',
    'load_power',
    'daily_yield',
  ] as const;

  private static readonly CONFLICT_COLUMNS = ['recorded_at'] as const;

  private static readonly UPSERT_BATCH_SIZE = 100;

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
    const results = await this.readingRepo.find({
      order: { recorded_at: 'DESC' },
      take: 1,
    });
    return results[0] ?? null;
  }

  async findById(id: number): Promise<Reading | null> {
    return this.readingRepo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.readingRepo.delete(id);
  }

  /**
   * Upsert multiple readings in batches. Uses ON CONFLICT DO UPDATE on
   * recorded_at (unique constraint) to avoid duplicates during re-imports.
   */
  async upsertMany(data: Partial<Reading>[]): Promise<number> {
    if (data.length === 0) return 0;

    let inserted = 0;

    for (
      let i = 0;
      i < data.length;
      i += ReadingsService.UPSERT_BATCH_SIZE
    ) {
      const chunk = data.slice(i, i + ReadingsService.UPSERT_BATCH_SIZE);

      for (const record of chunk) {
        await this.readingRepo
          .createQueryBuilder()
          .insert()
          .into(Reading)
          .values(record)
          .orUpdate(
            [...ReadingsService.UPSERT_COLUMNS],
            [...ReadingsService.CONFLICT_COLUMNS],
            { skipUpdateIfNoValuesChanged: true },
          )
          .execute();
        inserted++;
      }

      this.logger.debug(
        `Upsert batch ${Math.floor(i / ReadingsService.UPSERT_BATCH_SIZE)}: ${chunk.length} records`,
      );
    }

    return inserted;
  }
}
