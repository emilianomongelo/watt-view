import { Module } from '@nestjs/common';
import { SolarService } from './solar.service';
import { SolarController } from './solar.controller';

@Module({
  controllers: [SolarController],
  providers: [SolarService],
  exports: [SolarService],
})
export class SolarModule {}
