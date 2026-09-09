declare module 'growatt' {
  interface GrowattConfig {
    server?: string;
    indexCandI?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
    lifeSignCallback?: () => void;
  }

  interface LoginResult {
    result: number;
    msg: string;
  }

  interface PlantListEntry {
    id: string;
    [key: string]: unknown;
  }

  interface PlantData {
    plantData?: {
      plantName?: string;
      lat?: string;
      lng?: string;
      city?: string;
      country?: string;
      timezone?: string;
      nominalPower?: string;
      eTotal?: string;
      location?: string;
      [key: string]: unknown;
    };
    weather?: Record<string, unknown>;
    devices?: Record<string, DeviceData>;
    [key: string]: unknown;
  }

  interface DeviceData {
    growattType?: string;
    totalData?: {
      epvToday?: string;
      epvTotal?: string;
      useEnergyToday?: string;
      useEnergyTotal?: string;
      chargeToday?: string;
      chargeTotal?: string;
      eDischargeToday?: string;
      eDischargeTotal?: string;
      [key: string]: unknown;
    };
    statusData?: {
      capacity?: string;
      ppv1?: string;
      panelPower?: string;
      batPower?: string;
      loadPower?: string;
      vBat?: string;
      vAcOutput?: string;
      gridPower?: string;
      vPv1?: string;
      iPv1?: string;
      [key: string]: unknown;
    };
    historyLast?: Record<string, unknown>;
    historyAll?: Record<string, unknown>[];
    deviceData?: {
      deviceModel?: string;
      sn?: string;
      datalogSn?: string;
      datalogTypeTest?: string;
      nominalPower?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export default class Growatt {
    constructor(config?: GrowattConfig);
    isConnected(): boolean;
    login(user: string, password: string): Promise<LoginResult>;
    sharePlantLogin(key: string): Promise<LoginResult>;
    demoLogin(): Promise<LoginResult>;
    getAllPlantData(options?: Record<string, unknown>): Promise<Record<string, PlantData>>;
    logout(): Promise<unknown>;
  }
}
