# Watt View — Engineering Specification

## Objective

Build a solar energy monitoring system that replaces the unreliable ShinePhone app for a Growatt SPF 5000 ES off-grid inverter installation in Mendoza, Argentina. The system must provide real-time monitoring via native desktop and mobile widgets, historical data tracking, and AI-powered insights — all backed by a self-hosted API that polls the inverter every 5 minutes.

## Problem Statement

The existing ShinePhone app has a short session timeout that logs the user out frequently, making continuous monitoring impractical. Additionally, the app provides no API for integration with custom dashboards, widgets, or AI agents. The user needs a reliable, always-on monitoring solution with native OS integration.

## Hardware Context

| Component | Details |
|-----------|---------|
| Inverter | Growatt SPF 5000 ES (off-grid, 5kW) |
| Datalogger | ShineWIFI-S (serial: JVH0G1X0A0) |
| Battery | Leoh 51.2V 100A lithium (~5.12 kWh) |
| Panels | 6× Amerisolar 430W (2.58 kWp total) |
| Location | Mendoza, Argentina (-34.556960, -68.307736) |
| Grid connection | None (fully off-grid) |

## Requirements

### Functional

1. **Real-time monitoring**: Battery SOC (%), PV power (W), load/consumption (W), battery power (W, charge/discharge), daily yield (kWh)
2. **Solar position tracking**: Sunrise, sunset, solar noon, daylight hours, sun path trajectory — using real coordinates, not city-center approximations
3. **Weather integration**: Current temperature, cloud cover, humidity, wind, solar radiation (GHI/DNI/DHI) from Open-Meteo
4. **Historical data**: Import and store all available historical readings from Growatt API (since installation date: 2026-08-08)
5. **macOS menu bar widget**: Native Swift app showing battery SOC and PV production in the macOS menu bar, with popover for detailed view
6. **Android app with widget**: Kotlin/Jetpack Compose app with Glance 4×1 home screen widget
7. **AI Chat Agent**: Natural language queries about solar data (e.g., "will the battery last through the night?", "how much do I consume between 1am-7am?")
8. **API authentication**: Bearer token to protect endpoints from unauthorized access

### Non-Functional

1. **Reliability**: Backend must run 24/7 on VPS with automatic restart on failure
2. **Rate limiting safety**: Never poll Growatt API faster than every 5 minutes to avoid account blocking
3. **Idempotent imports**: Historical data re-import must not create duplicates
4. **Self-hosted**: All infrastructure on user-controlled VPS, no external SaaS dependencies
5. **Coordinate accuracy**: Solar calculations must use real installation coordinates, not Growatt's forced city-center values

### Constraints

1. **Growatt API limitation**: Must use Legacy ShinePhone API (reverse-engineered) — OpenAPI V1 only supports MIN/SPH devices, not SPF
2. **Growatt rate limiting**: Aggressive rate limiting since Feb 2023; accounts get blocked for excessive calls
3. **ShineWIFI-S has no local API**: Cannot read data directly from datalogger; must go through Growatt cloud
4. **5-minute data resolution**: Datalogger pushes data every 5 minutes by default (configurable to 1 min)
5. **No grid connection**: System is off-grid; no net metering or grid import/export data
6. **AGP 9 breaking changes**: Android Gradle Plugin 9.x removed kotlin-android plugin, requires compose-compiler plugin, changed kotlinOptions to kotlin.jvmToolchain

## Architecture

### System Overview

```
Growatt Cloud → (Legacy API, 5min poll) → NestJS Backend (VPS 24/7)
                                              ↓
                                         PostgreSQL
                                              ↓
                          ┌───────────────────┼───────────────────┐
                          ↓                   ↓                   ↓
                    macOS Widget        Android App          Swagger UI
                    (Swift/MenuBar)    (Kotlin/Compose)      (API Docs)
```

### Backend (NestJS 12)

| Module | Responsibility |
|--------|---------------|
| `growatt/` | API client (session-based auth), cron poller (5min), historical data fetcher (paginated) |
| `solar/` | SunCalc wrapper: sunrise/sunset, sun position, daylight hours, daily sun path |
| `weather/` | Open-Meteo client: current weather, hourly forecast, daily forecast, solar radiation |
| `readings/` | TypeORM entity, CRUD, UPSERT for idempotent imports |
| `status/` | Composed endpoint: solar + weather + growatt data in single response |
| `chat/` | OpenAI-compatible LLM proxy with solar context injection |
| `auth/` | Bearer token guard (global, configurable via API_TOKEN env) |

### Database Schema

- **readings**: time-series data (recorded_at unique, battery_soc, battery_power, pv_power, load_power, daily_yield)
- **devices**: inverter + battery metadata
- **plant_config**: location, panel count, battery capacity

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Backend owns all Growatt communication | Single source of truth, avoids rate limiting from multiple clients |
| .env coordinates override API coordinates | Growatt forces city center, not real installation location |
| UPSERT on recorded_at | Idempotent historical imports |
| Bearer token auth (not OAuth) | Single user, no third-party access needed |
| TypeORM 1.x | User's explicit choice for latest features |
| suncalc for solar position | Zero dependencies, local calculation, no API calls |
| Open-Meteo for weather | Free, no API key, includes solar radiation data |

## Definition of Done

- [x] Backend API running 24/7 on VPS with systemd
- [x] Growatt polling every 5 minutes with data stored in PostgreSQL
- [x] Historical data import (Aug 8 → today, ~10K readings)
- [x] Solar position calculations with real coordinates
- [x] Weather data with solar radiation
- [x] API token authentication
- [x] Swagger documentation
- [x] macOS menu bar widget showing real-time data
- [x] GitHub Actions CI/CD (push → deploy)
- [x] Verification harness (typecheck + lint + test)
- [ ] Android app building in Android Studio
- [ ] AI Chat Agent
- [ ] Demo video

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
| HTTP client | growatt (npm) | 0.7.7 |
| Testing | Vitest | 5.0.0 |
| Linting | ESLint | 10.10.0 |
| macOS Widget | Swift/SwiftUI | 6.3.3 |
| Android | Kotlin/Compose | 2.3.21 |
| Android Widget | Glance | 1.2.0 |
| CI/CD | GitHub Actions | — |
