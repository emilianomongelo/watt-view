import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { GrowattModule } from '../growatt/growatt.module';
import { SolarModule } from '../solar/solar.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [GrowattModule, SolarModule, WeatherModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
