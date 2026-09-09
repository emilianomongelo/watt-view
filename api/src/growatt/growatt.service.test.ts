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
});
