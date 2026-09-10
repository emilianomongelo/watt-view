# Watt View — AI Development Log

## Session Overview

**Date**: September 8-10, 2026
**Duration**: ~6 hours across 2 sessions
**Tool**: MiMoCode (orchestrator + specialized subagents)
**Commits**: 28 commits, 58+ files created

---

## Iteration 1: Project Discovery & Research

### Context
User has a Growatt SPF 5000 ES inverter with ShineWIFI-S datalogger. The ShinePhone app has short session timeouts. User wants native widgets + AI chat.

### Research Phase (4 parallel researchers)
- **Researcher-1**: Growatt API — Found Legacy API (reverse-engineered) and OpenAPI V1. Critical finding: V1 only supports MIN/SPH devices, NOT the user's SPF 5000 ES.
- **Researcher-2**: Google Nest Mini — Found that Conversational Actions were deprecated June 2023. Custom voice queries no longer possible.
- **Researcher-3**: macOS MenuBar — Found MenuBarExtra API (macOS 13+), the modern SwiftUI approach.
- **Researcher-4**: ShineWIFI-S — Found no local API on datalogger. But SPF 5000 ES has full Modbus RTU registers (future Phase 3).

### Key Human Decisions
1. **Use Legacy API** (not V1) — because V1 doesn't support SPF
2. **Skip Google Home** — deprecated platform
3. **No Modbus adapter for now** — use cloud API
4. **Backend runs 24/7 on VPS** — clients poll backend, not Growatt directly

### Outcome
Architecture decided: NestJS backend + Swift macOS widget + Kotlin Android app.

---

## Iteration 2: Backend Scaffold

### What happened
Engineer subagent created 38 files in a single pass:
- All NestJS modules (growatt, solar, weather, readings, status, chat)
- TypeORM entity, Vitest config, ESLint flat config
- Solar service fully implemented with suncalc
- Weather service with Open-Meteo integration
- Verification harness (`npm run check`)

### Verification
```
✓ typecheck passed
✓ lint passed
✓ 10/10 tests passed
```

### Notable: suncalc import issue
The engineer discovered that `suncalc` ships its own TypeScript types (making `@types/suncalc` redundant) and uses `Date | null` return types. The SolarTimes interface was updated to handle nullable dates.

---

## Iteration 3: Growatt API Integration

### Discovery
Created a dump script (`dump-growatt-raw.ts`) to inspect the raw API response structure. Found the exact field names for the SPF 5000 ES:

```
statusData.capacity = Battery SOC (47%)
statusData.ppv1 = PV Power (474W)
statusData.batPower = Battery Power (-258W, negative=charging)
statusData.loadPower = Load Power (162W)
totalData.epvToday = Daily Yield (0.1 kWh)
```

### Implementation
Replaced stubs with real `growatt` npm package integration. Added session management with `ensureSession()` auto-reconnect.

### Verification
Live test returned real data from the inverter:
```
Battery SOC: 47% | PV: 474W | Load: 162W | Status: connected
```

---

## Iteration 4: Deployment Infrastructure

### What was created
- GitHub Actions workflow (`deploy.yml`) — auto-deploy on push to main
- Systemd service file (`watt-view.service`)
- nginx reverse proxy config
- SSH helper script

### Critical fix: dist path
NestJS build outputs to `dist/src/main.js` (not `dist/main.js`) because tsconfig has no `rootDir`. The systemd service had to be updated.

### Critical fix: esModuleInterop
The `growatt` npm package is CJS. Without `esModuleInterop: true` in tsconfig, the compiled JS uses `growatt_1.default` which is undefined. Adding the flag wraps CJS imports with `__importDefault()`.

**Autonomous loop**: ACT (implement) → VERIFY (deploy fails) → OBSERVE (`growatt_1.default is not a constructor`) → FIX (add esModuleInterop) → VERIFY (deploy succeeds)

---

## Iteration 5: Coordinate Priority

### Problem
The Growatt API returns coordinates for Mendoza city center (-32.89, -68.83), not the user's actual installation location (-34.556960, -68.307736). Solar calculations were off by ~200km.

### Fix
Updated `growatt.service.ts` to prioritize `SOLAR_LAT`/`SOLAR_LON` from .env over API values. Updated `status.service.ts` to use ConfigService instead of `process.env`.

---

## Iteration 6: API Authentication

### Implementation
Created `ApiTokenGuard` — a NestJS global guard that checks `Authorization: Bearer <token>`. When `API_TOKEN` is empty, all requests pass through (development mode).

Added Swagger docs with `@ApiBearerAuth()` on all controllers.

Generated UUID: `73f42ef8-263b-4fee-9c1e-a55208639f3e`

---

## Iteration 7: Historical Data Import

### Discovery
Created `dump-growatt-history.ts` to inspect historical data structure. Found that `historyAll` (not `historyLast`) contains the array when `historyAll: true` option is used.

Field mapping:
```
calendar → recorded_at (ISO timestamp)
ppv → pv_power (W)
capacity → battery_soc (%)
pBat → battery_power (W, neg=charging)
outPutPower → load_power (W)
epvToday → daily_yield (kWh)
```

### Implementation
- `POST /api/readings/import?from=ISO&to=ISO` endpoint
- Paginated fetch (80 records/page, 1s delay between pages)
- UPSERT on `recorded_at` unique constraint
- 50-page safety cap

### Critical fix: Circular dependency
GrowattModule imports ReadingsModule (for poller) and ReadingsModule imports GrowattModule (for import endpoint). Fixed with `forwardRef()` in both modules.

**Autonomous loop**: ACT (add import) → VERIFY (deploy crashes) → OBSERVE (`UndefinedModuleException`) → FIX (forwardRef) → VERIFY (deploy succeeds)

### Import results
```
Aug 8-15:  2,151 records
Aug 15-22: 2,221 records
Aug 22-29: 2,183 records
Aug 29-Sep1: 1,136 records
Sep 1-9:   2,430 records
Total: ~10,121 readings
```

---

## Iteration 8: macOS Widget

### Initial build
Created 14 Swift files: MenuBarExtra app with StatusBarLabel, BatteryIndicator, PowerFlowView, SolarPopoverView, SettingsView, SolarAPIClient, SolarDataModel.

### Bug chain (3 consecutive autonomous fixes)

**Bug 1: Connection Error**
- Symptom: Widget shows "Connection Error" on launch
- Root cause: `apiToken` in SolarAPIClient defaults to empty string `""` when UserDefaults has no value yet (first launch)
- Fix: Changed default from `""` to the actual token
- Verification: nginx log shows `GET /api/status` → 200

**Bug 2: 0% on launch**
- Symptom: Menu bar shows "0%" and "0.0kW" for 2 seconds before data loads
- Root cause: `startAutoRefresh()` was never called on app launch
- Fix: Added `init()` to SolarDataModel that calls `startAutoRefresh()` via Task
- Verification: Data loads automatically on launch

**Bug 3: Inverted charge/discharge**
- Symptom: Shows "1311 W discharging" when PV > Load (should be charging)
- Root cause: Growatt convention is negative=charging, positive=discharging. BatteryIndicator had it backwards.
- Fix: Swapped the sign logic in `powerLabel`
- Verification: User confirms correct "1311 W charging" display

### Port 80 proxy
VPS cloud firewall blocks port 3000. Added nginx config to proxy port 80 → 3000. Updated widget default URL.

---

## Iteration 9: Android App

### Initial build
General agent created 43 files: Gradle Kotlin DSL, Hilt DI, Retrofit 3, Jetpack Compose, Glance 4×1 widget, DataStore, Navigation Compose.

### Gradle configuration chain (7 consecutive fixes)

| Error | Fix |
|-------|-----|
| KSP `2.4.20-1.0.29` not found | KSP versioning changed, use `2.3.12` |
| Kotlin `2.3.12` plugin not found | Kotlin uses `2.3.0, 2.3.10, 2.3.20, 2.3.21` (not 2.3.12) |
| `kotlin-android` plugin error | AGP 9 has Kotlin built-in, remove plugin |
| `kotlinOptions` unresolved | AGP 9 uses `kotlin { jvmToolchain() }` |
| Compose Compiler required | Re-add `compose-compiler` plugin (still needed since Kotlin 2.0) |
| AGP 9.4.0 not supported | User's Android Studio max is 9.3.0 |
| JDK 17 not found | User has JDK 21, changed toolchain |

**This was a 7-iteration autonomous loop** where each build error was diagnosed and fixed without the user providing technical solutions.

---

## Key Patterns Observed

### 1. Research → Decide → Implement → Verify
Every major decision was preceded by research from specialized subagents. No architectural choice was made on assumptions.

### 2. Dump before mapping
Before implementing Growatt API integration, we ran dump scripts to see the EXACT field names from the real API. This prevented wrong field mappings.

### 3. Fail fast, fix fast
The verification harness (`npm run check`) caught issues before deployment. When deployment failed, the error logs were immediately available via SSH.

### 4. Parallel where possible, sequential where necessary
Research ran in parallel. Backend + macOS widget ran in parallel. But API integration → status service → auth were sequential (dependencies).

### 5. Human as decision-maker, agent as executor
The human decided: architecture, priorities, which features to include, which platform to skip. The agent implemented, tested, fixed, and verified.
