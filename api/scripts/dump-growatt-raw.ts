/**
 * Dump raw Growatt API response structure for SPF 5000 ES.
 * Shows ALL fields and their values to identify correct field names.
 * Usage: npx tsx scripts/dump-growatt-raw.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });
import Growatt from 'growatt';

async function main() {
  const user = process.env.GROWATT_USERNAME;
  const pass = process.env.GROWATT_PASSWORD;

  if (!user || !pass) {
    console.error('ERROR: credentials not set');
    process.exit(1);
  }

  const growatt = new Growatt({});
  
  try {
    await growatt.login(user, pass);
    const plantData = await growatt.getAllPlantData({});

    for (const plantId of Object.keys(plantData)) {
      const plant = plantData[plantId];

      console.log('\n=== PLANT DATA ===');
      if (plant.plantData) {
        for (const [key, val] of Object.entries(plant.plantData)) {
          console.log(`  plant.${key} = ${JSON.stringify(val)}`);
        }
      }

      console.log('\n=== TOP-LEVEL PLANT KEYS ===');
      console.log('  ', Object.keys(plant).join(', '));

      if (plant.devices) {
        for (const deviceId of Object.keys(plant.devices)) {
          const device = plant.devices[deviceId];
          console.log(`\n=== DEVICE: ${deviceId} ===`);
          console.log('  Top-level keys:', Object.keys(device).join(', '));

          if (device.deviceData) {
            console.log('\n  --- deviceData fields ---');
            const dd = device.deviceData;
            for (const [key, val] of Object.entries(dd)) {
              if (val !== null && val !== undefined && val !== '') {
                console.log(`    ${key} = ${JSON.stringify(val)}`);
              }
            }
          }

          // Also check for other data objects
          for (const key of Object.keys(device)) {
            if (key !== 'deviceData' && typeof device[key] === 'object' && device[key] !== null) {
              console.log(`\n  --- ${key} (object) ---`);
              const obj = device[key] as Record<string, unknown>;
              for (const [k, v] of Object.entries(obj)) {
                if (v !== null && v !== undefined && v !== '') {
                  console.log(`    ${k} = ${JSON.stringify(v)}`);
                }
              }
            }
          }
        }
      }
    }

    await growatt.logout();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
