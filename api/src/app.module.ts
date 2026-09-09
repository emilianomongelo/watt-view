import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { validate } from './config/environment';
import { GrowattModule } from './growatt/growatt.module';
import { ReadingsModule } from './readings/readings.module';
import { StatusModule } from './status/status.module';
import { SolarModule } from './solar/solar.module';
import { WeatherModule } from './weather/weather.module';
import { ChatModule } from './chat/chat.module';
import { Reading } from './readings/reading.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities: [Reading],
        synchronize: true, // Use migrations in production
      }),
    }),
    ScheduleModule.forRoot(),
    GrowattModule,
    ReadingsModule,
    StatusModule,
    SolarModule,
    WeatherModule,
    ChatModule,
  ],
})
export class AppModule {}
