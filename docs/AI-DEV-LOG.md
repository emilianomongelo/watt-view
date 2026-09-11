# Watt View — AI Development Log

## Session Overview

**Date**: September 8-10, 2026
**Duration**: ~6 hours across 2 sessions
**Platform**: MiMoCode — orchestrated agent system with specialized subagents
**Product**: Native macOS menu bar widget for solar energy monitoring
**Commits**: 30+

### Tools & Infrastructure

| Tool | Role |
|------|------|
| **MiMoCode Orchestrator** | Plans, delegates, synthesizes, makes architectural decisions |
| **Researcher subagents** (7×) | External web research, API docs, library comparison |
| **Engineer subagents** (4×) | Code implementation, build verification, test writing |
| **General subagents** (2×) | Multi-step autonomous work |
| **SCE Memory (Graphiti)** | Cross-session knowledge graph for decisions, field mappings, conventions |
| **SCE Semantic Search (LightRAG)** | Semantic code search by concept, not file path |
| **Session Checkpoint** | Persistent session state with directives, error log, task tree |
| **html-to-video-pipeline** | Animated HTML → MP4 demo video (Playwright + ffmpeg) |

### Memory-Driven Development

The SCE knowledge graph preserved critical decisions across sessions:

**Example — SPF 5000 ES field mapping saved to Graphiti:**
```
Saved: "capacity=batterySoc, ppv1=pvPower, batPower=negative means charging"
Later retrieved when implementing macOS widget BatteryIndicator
Result: Correct sign convention from the start (no debugging needed)
```

**Example — AGP 9 breaking changes saved to Graphiti:**
```
Saved: "kotlin-android is BUILT-IN in AGP 9, remove it.
        compose-compiler is STILL REQUIRED. kotlinOptions removed,
        use android.kotlin { jvmToolchain(N) }."
Later retrieved when Android build failed 3 times in a row
Result: Each fix applied from memory, not from re-research
```

**Example — semantic code search for poller behavior:**
```
Query: "how does the growatt poller save readings to database"
Results: growatt.poller.ts (0.51), ARCHITECTURE.md (0.50),
         growatt.module.ts (0.49), readings.controller.ts (0.41)
Use: Understanding module wiring before making changes
```

---

## Iteration 1: Discovery & Research

### Context
User has a Growatt SPF 5000 ES inverter with ShineWIFI-S datalogger in Mendoza, Argentina. The ShinePhone app has short session timeouts. User wants a native macOS menu bar widget showing battery SOC and solar production.

### Phase
**4 parallel researcher subagents** investigated:
1. Growatt API — Found Legacy API (reverse-engineered) and OpenAPI V1
2. Google Nest Mini — Found Conversational Actions deprecated June 2023
3. macOS MenuBar — Found MenuBarExtra API (macOS 13+)
4. ShineWIFI-S — Found no local API; must use cloud

### Critical Finding
**OpenAPI V1 only supports MIN/SPH devices.** The user's SPF 5000 ES requires the Legacy ShinePhone API (username + MD5 password, session-based). This was discovered by reading the `growattServer` Python library docs — not from official Growatt documentation.

### Human Decisions
- Use Legacy API (not V1)
- Skip Google Home (deprecated platform)
- No Modbus adapter for now
- Backend runs 24/7 on VPS, clients poll backend

---

## Iteration 2: Backend Scaffold

### What Happened
A single engineer subagent created 38 files in one pass: all NestJS modules, TypeORM entity, Vitest config, ESLint flat config, solar service with suncalc, weather service with Open-Meteo, verification harness.

### Verification
```
✓ typecheck passed
✓ lint passed  
✓ 10/10 tests passed
```

### Notable Discovery
suncalc ships its own TypeScript types (making `@types/suncalc` redundant) and returns `Date | null` (not `Date`). The SolarTimes interface was updated to handle nullable dates.

---

## Iteration 3: Real Growatt API Integration

### Discovery Phase
Created `dump-growatt-raw.ts` to inspect the raw API response. Found the exact field names for SPF 5000 ES:

```
statusData.capacity = Battery SOC (47%)
statusData.ppv1 = PV Power (474W)  
statusData.batPower = Battery Power (-258W, negative=charging)
statusData.loadPower = Load Power (162W)
totalData.epvToday = Daily Yield (0.1 kWh)
```

### Implementation
Replaced stubs with real `growatt` npm package. Added session management with `ensureSession()` auto-reconnect.

### Verification
Live test returned real data:
```
Battery SOC: 47% | PV: 474W | Load: 162W | Status: connected
```

---

## Iteration 4: Deployment & Autonomous Loop #1

### Setup
Created GitHub Actions workflow, systemd service, nginx config.

### Autonomous Loop: CJS Import Failure
| Step | What happened |
|------|---------------|
| ACT | Implement `import Growatt from 'growatt'` |
| VERIFY | Deploy fails on VPS |
| OBSERVE | `TypeError: growatt_1.default is not a constructor` |
| FIX | Add `esModuleInterop: true` to tsconfig.json |
| VERIFY | Deploy succeeds, API returns real inverter data |

**No human prompt between the failure observation and the fix.**

---

## Iteration 5: Coordinate Priority & Autonomous Loop #2

### Problem
Growatt API returns city center coordinates (-32.89, -68.83), not the user's real installation (-34.556960, -68.307736). Solar calculations were off by ~200km.

### Fix
Updated `growatt.service.ts` to prioritize `SOLAR_LAT`/`SOLAR_LON` from .env over API values.

---

## Iteration 6: API Authentication

Created `ApiTokenGuard` — global NestJS guard checking `Authorization: Bearer <token>`. When `API_TOKEN` is empty, all requests pass through (dev mode). Generated UUID token. Added Swagger docs with `@ApiBearerAuth()`.

---

## Iteration 7: Historical Import & Autonomous Loop #3

### Discovery
Created `dump-growatt-history.ts`. Found that `historyAll` (not `historyLast`) contains the array when `historyAll: true` option is used. Max 80 records per page.

### Implementation
`POST /api/readings/import?from=ISO&to=ISO` with paginated fetch, UPSERT on `recorded_at`.

### Autonomous Loop: Circular Dependency
| Step | What happened |
|------|---------------|
| ACT | Add GrowattModule import to ReadingsModule |
| VERIFY | Deploy crashes |
| OBSERVE | `UndefinedModuleException` |
| FIX | Apply `forwardRef()` to both modules |
| VERIFY | Deploy succeeds |

### Import Results
```
Aug 8-9:    ~10,121 total readings imported
Sept 1-9:    2,430 readings
```

---

## Iteration 8: macOS Widget & Autonomous Loop #4 (3 consecutive)

### Build
Created 14 Swift files: MenuBarExtra app with StatusBarLabel, BatteryIndicator, PowerFlowView, SolarPopoverView, SettingsView, SolarAPIClient, SolarDataModel.

### Bug Chain (3 fixes, no human technical instructions)

**Bug 1: Connection Error**
- OBSERVE: Widget shows "Connection Error"
- ROOT CAUSE: `apiToken` defaults to empty string on first launch (no UserDefaults yet)
- FIX: Default to actual token in SolarAPIClient
- VERIFY: nginx log shows 200

**Bug 2: 0% on launch**
- OBSERVE: Menu bar shows "0%" for 2 seconds
- ROOT CAUSE: `startAutoRefresh()` never called on launch
- FIX: Add `init()` to SolarDataModel
- VERIFY: Data loads automatically

**Bug 3: Inverted charge/discharge**
- OBSERVE: Shows "1311 W discharging" when charging
- ROOT CAUSE: Growatt convention neg=charging, widget had it backwards
- FIX: Swap sign logic in powerLabel
- VERIFY: Correct "1311 W charging"

### Infrastructure Fix
VPS cloud firewall blocks port 3000. Added nginx proxy (80→3000). Updated widget default URL.

---

## Iteration 9: Android App (Out of Scope — Future Phase 2)

Created 43-file Kotlin/Compose project with Glance widget. Encountered 7 consecutive Gradle/AGP 9 configuration issues, all fixed autonomously. Project exists in repo but is not part of competition submission.

---

## Iteration 10: Competition Documentation

Created 4 docs for submission: SPEC.md, SYSTEM.md, AI-DEV-LOG.md, README.md. Scoped product to menu bar widget + backend. Android/AI Chat deferred to Phase 2.

---

## Key Patterns

### Research → Decide → Implement → Verify
Every major decision was preceded by research. No architectural choice was made on assumptions.

### Dump before mapping
Before implementing Growatt API, we ran dump scripts to see EXACT field names from real data. This prevented wrong mappings.

### Fail fast, fix fast
Verification harness (`npm run check`) caught issues before deployment. Deployment errors were available via logs immediately.

### Parallel where possible, sequential where necessary
Research: parallel. Backend + widget: parallel. API → status → auth: sequential (dependencies).

### Human as decision-maker, agent as executor
Human decided: architecture, priorities, scope, which platform to skip. Agent implemented, tested, fixed, verified.
