/**
 * Minimal Growatt API connection test.
 * Reads credentials from .env (GROWATT_USERNAME, GROWATT_PASSWORD).
 * Usage: npx tsx scripts/test-growatt-connection.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root (shared across all modules)
config({ path: resolve(__dirname, '../../.env') });
import Growatt from 'growatt';

async function main() {
  const user = process.env.GROWATT_USERNAME;
  const pass = process.env.GROWATT_PASSWORD;

  if (!user || !pass) {
    console.error('ERROR: GROWATT_USERNAME and GROWATT_PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log(`\n🔌 Connecting to Growatt API as "${user}"...\n`);

  const growatt = new Growatt({});

  try {
    // 1. Login
    const loginResult = await growatt.login(user, pass);
    console.log('✅ Login:', JSON.stringify(loginResult, null, 2));

    // 2. Get all plant data
    console.log('\n📡 Fetching plant data...\n');
    const plantData = await growatt.getAllPlantData({});

    // Print plant keys
    const plantKeys = Object.keys(plantData);
    console.log(`📋 Found ${plantKeys.length} plant(s):`);

    for (const plantId of plantKeys) {
      const plant = plantData[plantId];
      console.log(`\n--- Plant: ${plantId} ---`);
      const pd = plant.plantData;
      console.log(`  Name: ${pd?.plantName ?? 'N/A'}`);
      console.log(`  Location: ${pd?.lat ?? 'N/A'}, ${pd?.lng ?? 'N/A'}`);
      console.log(`  City: ${pd?.city ?? 'N/A'}, ${pd?.country ?? 'N/A'}`);
      console.log(`  Nominal Power: ${pd?.nominalPower ?? 'N/A'} W`);
      console.log(`  Total Yield: ${pd?.eTotal ?? 'N/A'} kWh`);

      // List devices
      if (plant.devices) {
        const deviceKeys = Object.keys(plant.devices);
        console.log(`  Devices: ${deviceKeys.length}`);
        for (const deviceId of deviceKeys) {
          const device = plant.devices[deviceId];
          console.log(`\n    📟 Device: ${deviceId}`);

          // Device metadata
          const dd = device.deviceData;
          console.log(`      Model: ${dd?.deviceModel ?? 'unknown'}`);
          console.log(`      Serial: ${dd?.sn ?? 'unknown'}`);
          console.log(`      Datalogger: ${dd?.datalogSn ?? 'N/A'} (${dd?.datalogTypeTest ?? 'unknown'})`);
          console.log(`      Nominal Power: ${dd?.nominalPower ?? 'N/A'} W`);

          // Real-time status (statusData)
          const sd = device.statusData;
          if (sd) {
            console.log(`\n      --- Real-time Status ---`);
            console.log(`      Battery SOC: ${sd.capacity ?? 'N/A'}%`);
            console.log(`      PV Power: ${sd.ppv1 ?? 'N/A'} W (panel: ${sd.panelPower ?? 'N/A'} W)`);
            console.log(`      Battery Power: ${sd.batPower ?? 'N/A'} W (neg=discharging)`);
            console.log(`      Load Power: ${sd.loadPower ?? 'N/A'} W`);
            console.log(`      Battery Voltage: ${sd.vBat ?? 'N/A'} V`);
            console.log(`      AC Output Voltage: ${sd.vAcOutput ?? 'N/A'} V`);
            console.log(`      Grid Power: ${sd.gridPower ?? 'N/A'} W`);
            console.log(`      PV1 Voltage: ${sd.vPv1 ?? 'N/A'} V`);
            console.log(`      PV1 Current: ${sd.iPv1 ?? 'N/A'} A`);
          }

          // Totals (totalData)
          const td = device.totalData;
          if (td) {
            console.log(`\n      --- Totals ---`);
            console.log(`      Today PV Yield: ${td.epvToday ?? 'N/A'} kWh`);
            console.log(`      Total PV Yield: ${td.epvTotal ?? 'N/A'} kWh`);
            console.log(`      Today Consumption: ${td.useEnergyToday ?? 'N/A'} kWh`);
            console.log(`      Today Charge: ${td.chargeToday ?? 'N/A'} kWh`);
            console.log(`      Today Discharge: ${td.eDischargeToday ?? 'N/A'} kWh`);
          }

          // History
          const hl = device.historyLast;
          if (hl) {
            console.log(`\n      --- Last History ---`);
            console.log(`      Battery: ${hl.capacity ?? 'N/A'}% @ ${hl.vBat ?? 'N/A'} V`);
            console.log(`      PV: ${hl.ppv ?? 'N/A'} W`);
            console.log(`      Output: ${hl.outPutPower ?? 'N/A'} W`);
            console.log(`      Battery Power: ${hl.pBat ?? 'N/A'} W`);
            console.log(`      Temperature: ${formatTemp(hl.InvTemperature)}`);
          }
        }
      }
    }

    // 3. Logout
    await growatt.logout();
    console.log('\n✅ Logged out successfully');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

function formatTemp(val: unknown): string {
  if (val === undefined || val === null) return 'N/A';
  return `${val}°C`;
}

main();
