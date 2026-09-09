export interface GrowattPlant {
  plantId: string;
  plantName: string;
  capacity: number;
}

export interface GrowattPlantInfo {
  plantId: string;
  plantName: string;
  capacity: number;
  todayYield: number;
  totalYield: number;
  status: string;
}

export interface GrowattInverterData {
  inverterId: string;
  pvPower: number;
  batterySoc: number;
  batteryPower: number;
  loadPower: number;
  dailyYield: number;
  recordedAt: Date;
}
