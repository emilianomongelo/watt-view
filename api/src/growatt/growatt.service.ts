import { Injectable, Logger } from '@nestjs/common';
import type {
  GrowattPlant,
  GrowattPlantInfo,
  GrowattInverterData,
} from './growatt.types';

@Injectable()
export class GrowattService {
  private readonly logger = new Logger(GrowattService.name);

  async login(): Promise<void> {
    // TODO: POST to Growatt API login endpoint
    // Store sessionToken for subsequent requests
    this.logger.debug('Growatt login — stub, no actual API call');
  }

  async getPlantList(): Promise<GrowattPlant[]> {
    // TODO: GET /plant/list with sessionToken
    this.logger.debug('getPlantList — returning empty stub');
    return [];
  }

  async getPlantInfo(plantId: string): Promise<GrowattPlantInfo> {
    // TODO: GET /plant/info with sessionToken
    this.logger.debug(`getPlantInfo(${plantId}) — returning empty stub`);
    return {
      plantId,
      plantName: '',
      capacity: 0,
      todayYield: 0,
      totalYield: 0,
      status: 'unknown',
    };
  }

  async getInverterData(plantId: string): Promise<GrowattInverterData> {
    // TODO: GET /inverter/data with sessionToken
    this.logger.debug(`getInverterData(${plantId}) — returning empty stub`);
    return {
      inverterId: '',
      pvPower: 0,
      batterySoc: 0,
      batteryPower: 0,
      loadPower: 0,
      dailyYield: 0,
      recordedAt: new Date(),
    };
  }
}
