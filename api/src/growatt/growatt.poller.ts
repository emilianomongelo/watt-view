import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GrowattService } from './growatt.service';
import { ReadingsService } from '../readings/readings.service';

@Injectable()
export class GrowattPoller {
  private readonly logger = new Logger(GrowattPoller.name);

  constructor(
    private readonly growattService: GrowattService,
    private readonly readingsService: ReadingsService,
  ) {}

  @Cron('*/5 * * * *')
  async handlePoll(): Promise<void> {
    this.logger.debug('Polling Growatt API');
    try {
      const plantId = process.env.GROWATT_PLANT_ID ?? '';
      if (!plantId) {
        this.logger.warn('GROWATT_PLANT_ID not set, skipping poll');
        return;
      }

      const inverterData = await this.growattService.getInverterData(plantId);

      await this.readingsService.create({
        recorded_at: new Date(),
        pv_power: inverterData.pvPower,
        battery_soc: inverterData.batterySoc,
        battery_power: inverterData.batteryPower,
        load_power: inverterData.loadPower,
        daily_yield: inverterData.dailyYield,
      });

      this.logger.debug('Poll completed successfully');
    } catch (error) {
      this.logger.error('Poll failed', error);
    }
  }
}
