/**
 * Dump raw Growatt historical data structure.
 * Fetches last 3 days of history to see field names.
 * Usage: npx tsx scripts/dump-growatt-history.ts
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

    // Get historical data for last 3 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    console.log(`\n📅 Fetching history from ${startDate.toISOString()} to ${endDate.toISOString()}\n`);

    const data = await growatt.getAllPlantData({
      plantData: false,
      deviceData: false,
      weather: false,
      statusData: false,
      totalData: false,
      historyAll: true,
      historyLastStartDate: startDate,
      historyLastEndDate: endDate,
      historyStart: 0,
    });

    for (const plantId of Object.keys(data)) {
      const plant = data[plantId];
      console.log(`=== Plant: ${plantId} ===`);
      console.log('Top-level keys:', Object.keys(plant).join(', '));

      if (plant.devices) {
        for (const deviceId of Object.keys(plant.devices)) {
          const device = plant.devices[deviceId];
          console.log(`\n=== Device: ${deviceId} ===`);
          console.log('Top-level keys:', Object.keys(device).join(', '));

          // Check both historyAll and historyLast
          const historyAll = device.historyAll;
          const historyLast = device.historyLast;
          
          console.log(`\nhistoryAll type: ${typeof historyAll}, isArray: ${Array.isArray(historyAll)}`);
          console.log(`historyLast type: ${typeof historyLast}, isArray: ${Array.isArray(historyLast)}`);
          
          // Try historyAll first (used when historyAll: true option)
          const history = historyAll ?? historyLast;
          if (Array.isArray(history)) {
            console.log(`\n📊 History records: ${history.length}`);
            if (history.length > 0) {
              console.log('\nFirst record (ALL fields):');
              const first = history[0] as Record<string, unknown>;
              for (const [key, val] of Object.entries(first)) {
                if (val !== null && val !== undefined && val !== '' && val !== 0) {
                  console.log(`  ${key} = ${JSON.stringify(val)}`);
                }
              }
              console.log('\nLast record:');
              const last = history[history.length - 1] as Record<string, unknown>;
              for (const [key, val] of Object.entries(last)) {
                if (val !== null && val !== undefined && val !== '' && val !== 0) {
                  console.log(`  ${key} = ${JSON.stringify(val)}`);
                }
              }
            }
          } else if (history && typeof history === 'object') {
            console.log('\nhistoryLast is an object (single record), keys:');
            for (const [key, val] of Object.entries(history as Record<string, unknown>)) {
              if (val !== null && val !== undefined && val !== '' && val !== 0) {
                console.log(`  ${key} = ${JSON.stringify(val)}`);
              }
            }
          } else {
            console.log(`\nhistoryLast type: ${typeof history}, value: ${JSON.stringify(history)}`);
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
