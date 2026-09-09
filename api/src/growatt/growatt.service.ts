import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Growatt from 'growatt';
import type {
  GrowattPlantInfo,
  GrowattInverterData,
  HistoryRecord,
} from './growatt.types';

@Injectable()
export class GrowattService {
  private readonly logger = new Logger(GrowattService.name);
  private growatt: Growatt;
  private loggedIn = false;

  constructor(private readonly configService: ConfigService) {
    this.growatt = new Growatt({});
  }

  private async ensureSession(): Promise<void> {
    if (this.growatt.isConnected()) {
      return;
    }

    const username = this.configService.get<string>('GROWATT_USERNAME');
    const password = this.configService.get<string>('GROWATT_PASSWORD');

    if (!username || !password) {
      throw new Error(
        'GROWATT_USERNAME and GROWATT_PASSWORD must be configured',
      );
    }

    await this.growatt.login(username, password);
    this.loggedIn = true;
    this.logger.log('Growatt session established');
  }

  async getPlantData(): Promise<{
    plantInfo: GrowattPlantInfo;
    inverterData: GrowattInverterData;
  }> {
    await this.ensureSession();

    const raw = await this.growatt.getAllPlantData({});
    const plantIds = Object.keys(raw);

    if (plantIds.length === 0) {
      throw new Error('No plants found in Growatt account');
    }

    // Use first plant (or configured one)
    const configuredId = this.configService.get<string>('GROWATT_PLANT_ID');
    const plantId =
      configuredId && raw[configuredId] ? configuredId : plantIds[0]!;

    const plant = raw[plantId];
    if (!plant) {
      throw new Error(`Plant ${plantId} not found in Growatt account`);
    }

    const plantInfo = this.mapPlantInfo(plantId, plant);
    const inverterData = this.mapInverterData(plant);

    return { plantInfo, inverterData };
  }

  async logout(): Promise<void> {
    if (this.loggedIn) {
      await this.growatt.logout();
      this.loggedIn = false;
      this.logger.log('Growatt session closed');
    }
  }

  /**
   * Fetch historical data from Growatt API (paginated, 80 records per page).
   * Handles calendar values as both ISO strings and Unix timestamps (seconds).
   */
  async getHistoricalData(
    startDate: Date,
    endDate: Date,
  ): Promise<HistoryRecord[]> {
    await this.ensureSession();

    const allRecords: HistoryRecord[] = [];
    let page = 0;
    const maxPages = 50; // safety limit

    while (page < maxPages) {
      const raw = await this.growatt.getAllPlantData({
        plantData: false,
        deviceData: false,
        weather: false,
        statusData: false,
        totalData: false,
        historyAll: true,
        historyLastStartDate: startDate,
        historyLastEndDate: endDate,
        historyStart: page,
      });

      const plantIds = Object.keys(raw);
      if (plantIds.length === 0) break;

      // Use configured plant or first
      const configuredId = this.configService.get<string>('GROWATT_PLANT_ID');
      const plantId =
        configuredId && raw[configuredId] ? configuredId : plantIds[0]!;
      const plant = raw[plantId];
      if (!plant?.devices) break;

      const deviceIds = Object.keys(plant.devices);
      if (deviceIds.length === 0) break;

      const device = plant.devices[deviceIds[0]!]!;
      const history = (device.historyAll ?? []) as HistoryRecord[];

      if (history.length === 0) break;

      allRecords.push(...history);
      this.logger.debug(`History page ${page}: ${history.length} records`);

      if (history.length < 80) break; // last page
      page++;

      // Rate limit: wait 1 second between pages
      await new Promise((r) => setTimeout(r, 1000));
    }

    return allRecords;
  }

  // ---------------------------------------------------------------------------
  // Mapping helpers — parse Growatt string values into typed numbers
  // ---------------------------------------------------------------------------

  private mapPlantInfo(
    plantId: string,
    plant: import('growatt').PlantData,
  ): GrowattPlantInfo {
    const pd = plant.plantData ?? {};

    // Prioritize .env coordinates over API (API forces city center, not real location)
    const envLat = this.configService.get<string>('SOLAR_LAT');
    const envLng = this.configService.get<string>('SOLAR_LON');
    const lat = envLat ? parseFloat(envLat) : parseFloat(String(pd.lat ?? '0'));
    const lng = envLng ? parseFloat(envLng) : parseFloat(String(pd.lng ?? '0'));

    return {
      plantId,
      plantName: pd.plantName ?? '',
      latitude: lat,
      longitude: lng,
      city: pd.city ?? '',
      country: pd.country ?? '',
      timezone: pd.timezone ?? '',
      nominalPower: parseFloat(String(pd.nominalPower ?? '0')),
      totalYield: parseFloat(String(pd.eTotal ?? '0')),
    };
  }

  private mapInverterData(
    plant: import('growatt').PlantData,
  ): GrowattInverterData {
    const devices = plant.devices ?? {};
    const deviceIds = Object.keys(devices);

    if (deviceIds.length === 0) {
      throw new Error('No devices found in plant');
    }

    // Use first device
    const deviceId = deviceIds[0]!;
    const device = devices[deviceId]!;
    const status = device.statusData ?? {};
    const total = device.totalData ?? {};
    const deviceData = device.deviceData ?? {};

    const num = (v: unknown): number => {
      if (v === undefined || v === null || v === '') return 0;
      return parseFloat(String(v));
    };

    return {
      // Device info
      inverterId: deviceId,
      deviceModel: deviceData.deviceModel ?? '',
      datalogSn: deviceData.datalogSn ?? '',
      datalogType: deviceData.datalogTypeTest ?? '',
      nominalPower: num(deviceData.nominalPower),

      // Real-time
      batterySoc: num(status.capacity),
      pvPower: num(status.ppv1),
      batteryPower: num(status.batPower),
      loadPower: num(status.loadPower),
      batteryVoltage: num(status.vBat),
      acOutputVoltage: num(status.vAcOutput),
      gridPower: num(status.gridPower),
      pvVoltage: num(status.vPv1),
      pvCurrent: num(status.iPv1),

      // Today totals
      dailyYield: num(total.epvToday),
      dailyConsumption: num(total.useEnergyToday),
      dailyCharge: num(total.chargeToday),
      dailyDischarge: num(total.eDischargeToday),

      // Cumulative
      totalYield: num(total.epvTotal),
      totalConsumption: num(total.useEnergyTotal),
      totalDischarge: num(total.eDischargeTotal),

      recordedAt: new Date(),
    };
  }
}
