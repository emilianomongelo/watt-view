import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reading } from './reading.entity';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { GrowattModule } from '../growatt/growatt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reading]), forwardRef(() => GrowattModule)],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
