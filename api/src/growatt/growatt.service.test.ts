import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GrowattService } from './growatt.service';

const mockInstance = {
  isConnected: vi.fn().mockReturnValue(false),
  login: vi.fn().mockResolvedValue({ result: 1, msg: 'OK' }),
  logout: vi.fn().mockResolvedValue({ result: 1, msg: 'OK' }),
  getAllPlantData: vi.fn().mockResolvedValue({
    '11099129': {
      plantData: {
        plantName: 'Casa',
        lat: '-32.89',
        lng: '-68.83',
        city: 'Mendoza',
        country: 'Argentina',
        timezone: '-3',
        nominalPower: '2580',
        eTotal: '344.7',
      },
      devices: {
        KCM7G34043: {
          deviceData: {
            deviceModel: 'SPF 5000 ES',
            sn: 'KCM7G34043',
            datalogSn: 'JVH0G1X0A0',
            datalogTypeTest: 'ShineWIFI-S',
            nominalPower: '5000.0',
          },
          totalData: {
            epvToday: '0.1',
            epvTotal: '344.7',
            useEnergyToday: '1.1',
            useEnergyTotal: '263.9',
            chargeToday: '0.4',
            eDischargeToday: '1.4',
            eDischargeTotal: '200.5',
          },
          statusData: {
            capacity: '47',
            ppv1: '474',
            batPower: '-258',
            loadPower: '162',
            vBat: '52.7',
            vAcOutput: '230.1',
            gridPower: '0',
            vPv1: '142.2',
            iPv1: '3.4',
          },
        },
      },
    },
  }),
};

vi.mock('growatt', () => {
  return {
    default: vi.fn().mockImplementation(function MockGrowatt() {
      return mockInstance;
    }),
  };
});

// Mock ConfigService
const mockConfigService = {
  get: vi.fn((key: string) => {
    const env: Record<string, string> = {
      GROWATT_USERNAME: 'testuser',
      GROWATT_PASSWORD: 'testpass',
      GROWATT_PLANT_ID: '11099129',
    };
    return env[key] ?? '';
  }),
};

describe('GrowattService', () => {
  let service: GrowattService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Restore mock instance defaults after clearAllMocks
    mockInstance.isConnected.mockReturnValue(false);
    mockInstance.login.mockResolvedValue({ result: 1, msg: 'OK' });
    mockInstance.logout.mockResolvedValue({ result: 1, msg: 'OK' });
    mockInstance.getAllPlantData.mockResolvedValue({
      '11099129': {
        plantData: {
          plantName: 'Casa',
          lat: '-32.89',
          lng: '-68.83',
          city: 'Mendoza',
          country: 'Argentina',
          timezone: '-3',
          nominalPower: '2580',
          eTotal: '344.7',
        },
        devices: {
          KCM7G34043: {
            deviceData: {
              deviceModel: 'SPF 5000 ES',
              sn: 'KCM7G34043',
              datalogSn: 'JVH0G1X0A0',
              datalogTypeTest: 'ShineWIFI-S',
              nominalPower: '5000.0',
            },
            totalData: {
              epvToday: '0.1',
              epvTotal: '344.7',
              useEnergyToday: '1.1',
              useEnergyTotal: '263.9',
              chargeToday: '0.4',
              eDischargeToday: '1.4',
              eDischargeTotal: '200.5',
            },
            statusData: {
              capacity: '47',
              ppv1: '474',
              batPower: '-258',
              loadPower: '162',
              vBat: '52.7',
              vAcOutput: '230.1',
              gridPower: '0',
              vPv1: '142.2',
              iPv1: '3.4',
            },
          },
        },
      },
    });

    service = new GrowattService(
      mockConfigService as unknown as import('@nestjs/config').ConfigService,
    );
  });

  it('getPlantData returns plant info and inverter data', async () => {
    const result = await service.getPlantData();

    expect(result.plantInfo).toBeDefined();
    expect(result.plantInfo.plantId).toBe('11099129');
    expect(result.plantInfo.plantName).toBe('Casa');
    expect(result.plantInfo.latitude).toBeCloseTo(-32.89);
    expect(result.plantInfo.longitude).toBeCloseTo(-68.83);
    expect(result.plantInfo.city).toBe('Mendoza');
    expect(result.plantInfo.country).toBe('Argentina');
    expect(result.plantInfo.nominalPower).toBe(2580);
    expect(result.plantInfo.totalYield).toBeCloseTo(344.7);
  });

  it('getPlantData returns inverter data with correct field mapping', async () => {
    const result = await service.getPlantData();
    const inv = result.inverterData;

    // Device info
    expect(inv.inverterId).toBe('KCM7G34043');
    expect(inv.deviceModel).toBe('SPF 5000 ES');
    expect(inv.datalogSn).toBe('JVH0G1X0A0');
    expect(inv.datalogType).toBe('ShineWIFI-S');
    expect(inv.nominalPower).toBe(5000);

    // Real-time status
    expect(inv.batterySoc).toBe(47);
    expect(inv.pvPower).toBe(474);
    expect(inv.batteryPower).toBe(-258);
    expect(inv.loadPower).toBe(162);
    expect(inv.batteryVoltage).toBeCloseTo(52.7);
    expect(inv.acOutputVoltage).toBeCloseTo(230.1);
    expect(inv.gridPower).toBe(0);
    expect(inv.pvVoltage).toBeCloseTo(142.2);
    expect(inv.pvCurrent).toBeCloseTo(3.4);

    // Today totals
    expect(inv.dailyYield).toBeCloseTo(0.1);
    expect(inv.dailyConsumption).toBeCloseTo(1.1);
    expect(inv.dailyCharge).toBeCloseTo(0.4);
    expect(inv.dailyDischarge).toBeCloseTo(1.4);

    // Cumulative
    expect(inv.totalYield).toBeCloseTo(344.7);
    expect(inv.totalConsumption).toBeCloseTo(263.9);
    expect(inv.totalDischarge).toBeCloseTo(200.5);

    // Recorded timestamp
    expect(inv.recordedAt).toBeInstanceOf(Date);
  });

  it('getPlantData throws when no plants exist', async () => {
    mockInstance.getAllPlantData.mockResolvedValueOnce({});

    await expect(service.getPlantData()).rejects.toThrow(
      'No plants found in Growatt account',
    );
  });

  it('logout closes session', async () => {
    // First call to getPlantData logs in
    await service.getPlantData();
    await service.logout();

    expect(mockInstance.logout).toHaveBeenCalled();
  });

  it('logout is a no-op when not logged in', async () => {
    await service.logout();

    expect(mockInstance.login).not.toHaveBeenCalled();
    expect(mockInstance.logout).not.toHaveBeenCalled();
  });

  it('getHistoricalData returns paginated history records', async () => {
    const historyRecords = [
      {
        calendar: '2025-01-15T10:00:00Z',
        ppv: 450,
        capacity: 65,
        pBat: -200,
        outPutPower: 180,
        epvToday: 2.5,
      },
      {
        calendar: '2025-01-15T10:05:00Z',
        ppv: 460,
        capacity: 66,
        pBat: -210,
        outPutPower: 175,
        epvToday: 2.6,
      },
    ];

    // First page returns 2 records (< 80 = last page)
    mockInstance.getAllPlantData.mockResolvedValueOnce({
      '11099129': {
        devices: {
          KCM7G34043: { historyAll: historyRecords },
        },
      },
    });

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toHaveLength(2);
    expect(result[0]!.calendar).toBe('2025-01-15T10:00:00Z');
    expect(result[0]!.ppv).toBe(450);
    expect(result[1]!.capacity).toBe(66);
  });

  it('getHistoricalData handles Unix timestamp calendar values', async () => {
    const historyRecords = [
      {
        calendar: 1736935200, // Unix timestamp in seconds
        ppv: 300,
        capacity: 50,
      },
    ];

    mockInstance.getAllPlantData.mockResolvedValueOnce({
      '11099129': {
        devices: {
          KCM7G34043: { historyAll: historyRecords },
        },
      },
    });

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.calendar).toBe(1736935200);
  });

  it('getHistoricalData returns empty array when no plants', async () => {
    mockInstance.getAllPlantData.mockResolvedValueOnce({});

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toEqual([]);
  });

  it('getHistoricalData returns empty array when no devices', async () => {
    mockInstance.getAllPlantData.mockResolvedValueOnce({
      '11099129': { devices: {} },
    });

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toEqual([]);
  });

  it('getHistoricalData stops when historyAll is empty', async () => {
    mockInstance.getAllPlantData.mockResolvedValueOnce({
      '11099129': {
        devices: {
          KCM7G34043: { historyAll: [] },
        },
      },
    });

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toEqual([]);
  });

  it('getHistoricalData stops when historyAll is undefined', async () => {
    mockInstance.getAllPlantData.mockResolvedValueOnce({
      '11099129': {
        devices: {
          KCM7G34043: {},
        },
      },
    });

    const result = await service.getHistoricalData(
      new Date('2025-01-15'),
      new Date('2025-01-16'),
    );

    expect(result).toEqual([]);
  });
});
