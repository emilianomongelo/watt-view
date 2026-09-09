import { Module } from '@nestjs/common';
import { GrowattService } from './growatt.service';
import { GrowattPoller } from './growatt.poller';
import { ReadingsModule } from '../readings/readings.module';

@Module({
  imports: [ReadingsModule],
  providers: [GrowattService, GrowattPoller],
  exports: [GrowattService],
})
export class GrowattModule {}
