# Watt View — Engineering Specification

## Objective

Build a native macOS menu bar widget that monitors a Growatt off-grid solar installation in real time, replacing the unreliable ShinePhone app. The widget connects to a self-hosted API that polls a Growatt SPF 5000 ES inverter every 5 minutes and presents battery status, solar production, consumption, and weather data directly in the macOS menu bar — no app window required.

## Problem Statement

The existing ShinePhone app has a short session timeout that logs the user out frequently, making continuous monitoring impractical. The user needs a glanceable, always-visible monitoring solution that lives in the macOS menu bar and updates automatically.

## Hardware Context

| Component | Details |
|-----------|---------|
| Inverter | Growatt SPF 5000 ES (off-grid, 5kW) |
| Datalogger | ShineWIFI-S (serial: JVH0G1X0A0) |
| Battery | Leoh 51.2V 100A lithium (~5.12 kWh) |
| Panels | 6× Amerisolar 430W (2.58 kWp total) |
| Location | Mendoza, Argentina (-34.556960, -68.307736) |
| Grid connection | None (fully off-grid) |

## Scope

### In Scope (Competition Submission)

| Component | Status |
|-----------|--------|
| NestJS backend API (VPS 24/7) | ✅ Working |
| Growatt polling (5min cron) | ✅ Working |
| Historical data import (~10K readings) | ✅ Working |
| Solar position tracking (suncalc) | ✅ Working |
| Weather + solar radiation (Open-Meteo) | ✅ Working |
| API authentication (Bearer token) | ✅ Working |
| Swagger documentation | ✅ Working |
| macOS menu bar widget (Swift) | ✅ Working |
| Verification harness (typecheck+lint+test) | ✅ Working |
| GitHub Actions CI/CD | ✅ Working |

### Out of Scope (Future Phases)

| Component | Phase |
|-----------|-------|
| Android app + widget | Phase 2 |
| AI Chat Agent | Phase 2 |
| Google Home integration | Deferred |
| USB-RS485 Modbus direct access | Phase 3 |
| Web dashboard | Not planned |

## Requirements

### Functional

1. **Real-time monitoring**: Battery SOC (%), PV power (W), load/consumption (W), battery power (W, charge/discharge), daily yield (kWh)
2. **Solar position tracking**: Sunrise, sunset, solar noon, daylight hours — using real coordinates from .env, not Growatt's forced city-center values
3. **Weather integration**: Current temperature, cloud cover, humidity, wind, solar radiation (GHI/DNI/DHI) from Open-Meteo
4. **Historical data**: Import and store all available readings from Growatt API since installation date (2026-08-08)
5. **macOS menu bar widget**: Native Swift/SwiftUI app showing battery SOC and PV production in the menu bar, with popover for detailed view (battery indicator, power flow, weather, manual refresh)
6. **API authentication**: Bearer token to protect all endpoints

### Non-Functional

1. **Reliability**: Backend must run 24/7 on VPS with automatic restart on failure (systemd)
2. **Rate limiting safety**: Never poll Growatt API faster than every 5 minutes
3. **Idempotent imports**: Historical data re-import must not create duplicates (UPSERT)
4. **Self-hosted**: All infrastructure on user-controlled VPS
5. **Coordinate accuracy**: Solar calculations must use real installation coordinates

### Constraints

1. **Growatt API**: Must use Legacy ShinePhone API (reverse-engineered) — OpenAPI V1 only supports MIN/SPH devices, not SPF
2. **Growatt rate limiting**: Aggressive rate limiting since Feb 2023; accounts get blocked for excessive calls
3. **ShineWIFI-S**: No local API on datalogger; must go through Growatt cloud
4. **5-minute resolution**: Datalogger pushes data every 5 minutes (configurable to 1 min)
5. **Off-grid**: No grid import/export; battery is the only storage
6. **macOS only**: Widget is Swift/SwiftUI, targets macOS 13.0+ (Ventura)

## Architecture

```
┌─────────────────────────────────────────────────┐
│              NestJS Backend (VPS 24/7)            │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Growatt  │  │  Solar   │  │   Weather     │  │
│  │ Poller   │  │ (suncalc)│  │ (Open-Meteo)  │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       └──────────────┼───────────────┘           │
│                      ↓                            │
│               ┌──────────────┐                    │
│               │  PostgreSQL  │                    │
│               └──────┬───────┘                    │
│                      ↓                            │
│               ┌──────────────┐                    │
│               │  /api/status │                    │
│               └──────┬───────┘                    │
└──────────────────────┼────────────────────────────┘
                       │ HTTP + Bearer token
                       ↓
              ┌─────────────────┐
              │  macOS Widget   │
              │  (Swift/SwiftUI)│
              │  MenuBarExtra   │
              └─────────────────┘
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Backend owns all Growatt communication | Single source of truth, avoids rate limiting |
| .env coordinates override API | Growatt forces city center, not real location |
| UPSERT on recorded_at | Idempotent historical imports |
| Bearer token (not OAuth) | Single user, no third-party access |
| suncalc for solar position | Zero deps, local calculation, no API key |
| Open-Meteo for weather | Free, no key, includes solar radiation |
| MenuBarExtra (not NSStatusItem) | Modern SwiftUI, 80% less code |
| @ObservableObject (not @Observable) | macOS 13 compatibility |

## Definition of Done

- [x] Backend API running 24/7 on VPS with systemd
- [x] Growatt polling every 5 minutes with data in PostgreSQL
- [x] Historical data import (Aug 8 → today, ~10K readings)
- [x] Solar position calculations with real coordinates
- [x] Weather data with solar radiation (GHI/DNI/DHI)
- [x] API token authentication + Swagger docs
- [x] macOS menu bar widget showing real-time data
- [x] GitHub Actions CI/CD (push → deploy)
- [x] Verification harness (typecheck + lint + test)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | NestJS | 12.0.1 |
| Language | TypeScript | 5.8.3 |
| ORM | TypeORM | 1.1.1 |
| Database | PostgreSQL | 17 |
| Scheduling | @nestjs/schedule | 12.0.1 |
| Solar calc | suncalc | 2.0.2 |
| Weather | Open-Meteo | REST API |
| Growatt client | growatt (npm) | 0.7.7 |
| Testing | Vitest | 5.0.0 |
| Linting | ESLint | 10.10.0 |
| macOS Widget | Swift/SwiftUI | 6.3.3 |
| CI/CD | GitHub Actions | — |
