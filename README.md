# Watt View

A native macOS menu bar widget that monitors a Growatt off-grid solar installation in real time. Battery status, solar production, consumption, and weather — always visible, always updating.

## What It Does

Watt View replaces the unreliable ShinePhone app with a system you control:

- **Menu bar display**: Battery SOC (%) and PV production (kW) always visible in your macOS menu bar
- **Detailed popover**: Click to see battery indicator, power flow, weather, daily yield
- **Real-time data**: Polls your Growatt SPF 5000 ES inverter every 5 minutes
- **Solar tracking**: Sunrise, sunset, daylight hours using your exact coordinates
- **Weather + radiation**: Temperature, cloud cover, solar radiation (GHI/DNI/DHI)
- **Historical data**: Import all readings since installation

## Architecture

```
Growatt Cloud ──(5min poll)──▶ NestJS Backend (VPS 24/7)
                                    │
                               PostgreSQL
                                    │
                                    ▼
                            /api/status (JSON)
                                    │
                                    ▼
                          macOS Menu Bar Widget
                          (Swift/SwiftUI, native)
```

## Quick Start

### Backend (VPS)

```bash
cd api
cp ../.env.example ../.env
# Edit .env with your Growatt credentials

npm install
npm run check    # typecheck + lint + test
npm run start    # starts on port 3000
```

### macOS Widget (Local Mac)

```bash
cd macos
swift build -c release
bash build.sh
open GrowattPlusMenuBar.app
```

Requires macOS 13.0+ (Ventura). No Apple Developer account needed.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROWATT_USERNAME` | Yes | Growatt account username |
| `GROWATT_PASSWORD` | Yes | Growatt account password |
| `GROWATT_PLANT_ID` | No | Plant ID (auto-detected if empty) |
| `SOLAR_LAT` | Yes | Installation latitude |
| `SOLAR_LON` | Yes | Installation longitude |
| `SOLAR_TIMEZONE` | No | Timezone (default: America/Argentina/Mendoza) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `API_TOKEN` | No | Bearer token for API auth (empty = no auth) |
| `PORT` | No | Server port (default: 3000) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Current: solar + weather + inverter data |
| `GET` | `/api/readings` | Historical readings |
| `GET` | `/api/readings/latest` | Most recent reading |
| `POST` | `/api/readings/import` | Import historical data from Growatt |
| `GET` | `/api/solar/today` | Sunrise, sunset, daylight hours |
| `GET` | `/api/solar/path?date=` | Hourly sun trajectory |
| `GET` | `/api/weather/current` | Current weather + solar radiation |
| `GET` | `/api/weather/forecast` | 7-day forecast |
| `GET` | `/api/docs` | Swagger UI |

All endpoints require `Authorization: Bearer <token>` when `API_TOKEN` is set.

## Project Structure

```
watt-view/
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── growatt/            # Growatt API client + 5min cron poller
│   │   ├── solar/              # suncalc wrapper (sunrise/sunset/path)
│   │   ├── weather/            # Open-Meteo client (weather + radiation)
│   │   ├── readings/           # PostgreSQL time-series + UPSERT imports
│   │   ├── status/             # Composed status endpoint
│   │   ├── chat/               # LLM proxy (Phase 2)
│   │   └── auth/               # Bearer token guard
│   └── scripts/                # Test scripts, data dumps
├── macos/                      # Swift MenuBarExtra widget
│   └── Sources/GrowattPlusMenuBar/
│       ├── App/                # @main, Info.plist
│       ├── Models/             # Codable API response models
│       ├── ViewModels/         # SolarDataModel (ObservableObject)
│       ├── Views/              # StatusBarLabel, BatteryIndicator, etc.
│       ├── Networking/         # SolarAPIClient (URLSession)
│       └── Utilities/          # Date formatting
├── docs/                       # Competition documentation
│   ├── SPEC.md                 # Engineering specification
│   ├── SYSTEM.md               # Agentic system map
│   └── AI-DEV-LOG.md           # Development log
├── infra/                      # Deployment configs
│   ├── systemd/                # watt-view.service
│   └── nginx/                  # Reverse proxy
├── ARCHITECTURE.md             # Mermaid diagrams
└── .env.example                # Environment template
```

## Deployment

Push to `main` → GitHub Actions → SSH to VPS → git pull → npm ci → build → restart systemd.

```bash
# VPS one-time setup
ssh your-vps
mkdir -p /home/deploy/watt-view
git clone <repo> /home/deploy/watt-view
cd watt-view/api && npm install && npm run build
sudo cp infra/systemd/watt-view.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable watt-view && sudo systemctl start watt-view
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
| Growatt client | growatt (npm) | 0.7.7 |
| macOS Widget | Swift/SwiftUI | 6.3.3 |
| Testing | Vitest | 5.0.0 |
| CI/CD | GitHub Actions | — |

## Hardware

| Component | Details |
|-----------|---------|
| Inverter | Growatt SPF 5000 ES (off-grid, 5kW) |
| Datalogger | ShineWIFI-S |
| Battery | Leoh 51.2V 100A lithium (~5.12 kWh) |
| Panels | 6× Amerisolar 430W (2.58 kWp) |
| Location | Mendoza, Argentina |

## License

Private — for personal use.
