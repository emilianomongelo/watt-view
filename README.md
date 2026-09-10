# Watt View

Solar energy monitoring system for Growatt off-grid inverters. Native macOS menu bar widget, Android app with home screen widget, and AI-powered insights — all backed by a self-hosted API.

## What It Does

Watt View replaces the unreliable ShinePhone app with a system you control:

- **Real-time monitoring**: Battery SOC, PV production, house consumption, battery charge/discharge
- **Solar position tracking**: Sunrise, sunset, daylight hours, sun path — using your exact coordinates
- **Weather + solar radiation**: Temperature, cloud cover, GHI/DNI/DHI from Open-Meteo
- **Historical data**: Import all readings since installation (paginated, idempotent)
- **macOS menu bar widget**: Always-visible battery % and production in kW
- **Android app + widget**: Kotlin/Jetpack Compose with Glance 4×1 home screen widget
- **AI Chat** (coming soon): Natural language queries about your solar data

## Architecture

```
Growatt Cloud ──(5min poll)──▶ NestJS Backend (VPS 24/7)
                                    │
                               PostgreSQL
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              macOS Widget    Android App      Swagger UI
              (Swift)        (Kotlin)         (/api/docs)
```

## Quick Start

### Prerequisites

- Node.js ≥ 22.12.0
- PostgreSQL 17+
- A Growatt account with an inverter registered

### Backend Setup

```bash
cd api
cp ../.env.example ../.env
# Edit .env with your Growatt credentials

npm install
npm run check    # typecheck + lint + test
npm run start    # starts on port 3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROWATT_USERNAME` | Yes | Growatt account username |
| `GROWATT_PASSWORD` | Yes | Growatt account password |
| `GROWATT_PLANT_ID` | No | Plant ID (auto-detected if empty) |
| `SOLAR_LAT` | Yes | Installation latitude |
| `SOLAR_LON` | Yes | Installation longitude |
| `SOLAR_TIMEZONE` | No | Timezone (default: America/Argentina/Mendoza) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_BASE_URL` | No | LLM API base URL (OpenAI-compatible) |
| `OPENAI_API_KEY` | No | LLM API key |
| `OPENAI_MODEL` | No | LLM model name |
| `API_TOKEN` | No | Bearer token for API auth (empty = no auth) |
| `PORT` | No | Server port (default: 3000) |

### macOS Widget

```bash
cd macos
swift build -c release
bash build.sh
open GrowattPlusMenuBar.app
```

Requires macOS 13.0+ (Ventura). No Apple Developer account needed.

### Android App

Open `android/` in Android Studio. Requires:
- Android SDK 36
- JDK 21

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Current status (solar + weather + growatt) |
| `GET` | `/api/readings` | Historical readings |
| `GET` | `/api/readings/latest` | Most recent reading |
| `POST` | `/api/readings/import` | Import historical data from Growatt |
| `GET` | `/api/solar/today` | Sunrise, sunset, daylight hours |
| `GET` | `/api/solar/path?date=` | Hourly sun trajectory |
| `GET` | `/api/weather/current` | Current weather + solar radiation |
| `GET` | `/api/weather/forecast` | 7-day forecast |
| `POST` | `/api/chat` | AI chat (coming soon) |
| `GET` | `/api/docs` | Swagger UI |

All endpoints require `Authorization: Bearer <token>` header when `API_TOKEN` is set.

## Project Structure

```
watt-view/
├── api/                    # NestJS backend
│   ├── src/
│   │   ├── growatt/        # Growatt API client + cron poller
│   │   ├── solar/          # suncalc wrapper
│   │   ├── weather/        # Open-Meteo client
│   │   ├── readings/       # PostgreSQL time-series
│   │   ├── status/         # Composed status endpoint
│   │   ├── chat/           # LLM proxy
│   │   └── auth/           # Bearer token guard
│   └── scripts/            # Test scripts, data dumps
├── macos/                  # Swift MenuBarExtra widget
│   └── Sources/GrowattPlusMenuBar/
├── android/                # Kotlin/Jetpack Compose app
│   └── app/src/main/java/com/wattview/app/
├── docs/                   # Competition documentation
│   ├── SPEC.md             # Engineering specification
│   ├── SYSTEM.md           # Agentic system map
│   └── AI-DEV-LOG.md       # Development log
├── infra/                  # Deployment configs
│   ├── systemd/            # watt-view.service
│   └── nginx/              # Reverse proxy config
└── ARCHITECTURE.md         # Mermaid diagrams
```

## Deployment

Push to `main` triggers GitHub Actions → SSH to VPS → git pull → npm ci → build → restart systemd service.

```bash
# VPS setup (one-time)
ssh your-vps
mkdir -p /home/deploy/watt-view
git clone <repo> /home/deploy/watt-view
sudo cp /home/deploy/watt-view/infra/systemd/watt-view.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable watt-view
```

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | NestJS | 12.0.1 |
| Language | TypeScript | 5.8.3 |
| ORM | TypeORM | 1.1.1 |
| Database | PostgreSQL | 17 |
| Solar calc | suncalc | 2.0.2 |
| Weather | Open-Meteo | REST API |
| macOS | Swift/SwiftUI | 6.3.3 |
| Android | Kotlin/Compose | 2.3.21 |
| Testing | Vitest | 5.0.0 |
| CI/CD | GitHub Actions | — |

## License

Private — for personal use.
