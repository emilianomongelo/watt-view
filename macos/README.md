# Growatt Plus — macOS Menu Bar App

A lightweight macOS menu bar app that monitors your Growatt solar energy system in real time.

## Features

- **Menu bar display** — battery SOC, current production (kW), at a glance
- **Popover dashboard** — battery ring, power flow, weather, daily yield
- **Auto-refresh** — polls the backend every 5 minutes (configurable)
- **Manual refresh** — one-click data fetch
- **Settings** — configurable API URL and refresh interval
- **No dock icon** — lives entirely in the menu bar (LSUIElement)

## Requirements

- macOS 13.0 (Ventura) or later
- Swift 5.9+ (included with Xcode 15+)
- A running [Growatt Plus backend](../../README.md) API

## Build

### Option A: Build script (fastest)

```bash
cd macos/
chmod +x build.sh
./build.sh
open GrowattPlusMenuBar.app
```

### Option B: Xcode

```bash
cd macos/
open Package.swift        # opens in Xcode
# Select "My Mac" as the destination, then ⌘R
```

> **Note:** The `.app` bundle approach (build.sh) correctly sets `LSUIElement` so the
> app only appears in the menu bar, not the dock. Running from Xcode will show a
> dock icon during development.

### Option C: Swift CLI

```bash
swift build
.build/release/GrowattPlusMenuBar
```

## Configuration

Click the gear icon in the popover or open the Settings window (⌘,) to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| API URL | `http://localhost:3000/api/status` | Backend endpoint |
| Refresh interval | 5 minutes | How often to poll |

## Architecture

```
Sources/GrowattPlusMenuBar/
├── App/                    Entry point + Info.plist
├── Models/                 Codable API response models
├── ViewModels/             SolarDataModel (@ObservableObject)
├── Views/                  SwiftUI views (popover, battery, power flow, settings)
├── Networking/             URLSession async/await client
└── Utilities/              Date formatting helpers
```

## API Contract

The app expects a JSON response matching this shape:

```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "battery": {
    "soc": 75.5,
    "power": 1200,
    "estimatedHours": 2.3
  },
  "solar": {
    "production": 4.5,
    "consumption": 1.2,
    "dailyYield": 18.7
  },
  "weather": {
    "temperature": 28.5,
    "cloudCover": 30,
    "condition": "Partly Cloudy"
  }
}
```

## License

MIT
