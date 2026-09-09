import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reading } from './reading.entity';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reading])],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
