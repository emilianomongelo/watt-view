export interface GrowattPlantInfo {
  plantId: string;
  plantName: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
  nominalPower: number;
  totalYield: number;
}

export interface GrowattInverterData {
  // Device info
  inverterId: string;
  deviceModel: string;
  datalogSn: string;
  datalogType: string;
  nominalPower: number;

  // Real-time (from statusData)
  batterySoc: number; // capacity: '47'
  pvPower: number; // ppv1: '474'
  batteryPower: number; // batPower: '-258' (neg = discharging)
  loadPower: number; // loadPower: '162'
  batteryVoltage: number; // vBat: '52.7'
  acOutputVoltage: number; // vAcOutput: '230.1'
  gridPower: number; // gridPower: '0'
  pvVoltage: number; // vPv1: '142.2'
  pvCurrent: number; // iPv1: '3.4'

  // Today totals (from totalData)
  dailyYield: number; // epvToday: '0.1'
  dailyConsumption: number; // useEnergyToday: '1.1'
  dailyCharge: number; // chargeToday: '0.4'
  dailyDischarge: number; // eDischargeToday: '1.4'

  // Cumulative (from totalData)
  totalYield: number; // epvTotal: '344.7'
  totalConsumption: number; // useEnergyTotal: '263.9'
  totalDischarge: number; // eDischargeTotal: '200.5'

  recordedAt: Date;
}
