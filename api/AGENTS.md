# Watt View API

## Overview

Solar energy monitoring system backend. Integrates Growatt SPF 5000 ES inverter API, solar position calculations (suncalc), weather data (Open-Meteo), and optional LLM-powered chat.

## Stack

- **Runtime:** Node.js >= 22.12.0
- **Framework:** NestJS 12 (TypeScript)
- **ORM:** TypeORM 1.x (PostgreSQL via pg)
- **Scheduling:** @nestjs/schedule (cron-based polling)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Linting:** ESLint 10 + typescript-eslint (flat config)
- **Build:** nest CLI (tsc under the hood)

## Project Structure

```
src/
├── config/          # Environment validation (class-validator)
├── growatt/         # Growatt API client + cron poller
├── readings/        # TypeORM entity + CRUD controller
├── status/          # Composed system status endpoint
├── solar/           # SunCalc wrapper (fully implemented)
├── weather/         # Open-Meteo API client
└── chat/            # OpenAI-compatible chat proxy
```

## Verification Pipeline

```bash
npm run check  # typecheck → lint → test (sequential, fail-fast)
```

1. `npm run typecheck` — `tsc --noEmit` (strict mode)
2. `npm run lint` — ESLint flat config
3. `npm run test` — Vitest

All three MUST pass before committing.

## Autonomous Loop Protocol

When making changes:
1. Run `npm run check` after each logical change
2. If typecheck fails, fix types before linting
3. If lint fails, fix before testing
4. If test fails, investigate and fix — never skip
5. Commit only when `npm run check` is green

## Commit Discipline

- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- One logical change per commit
- Never commit `.env`, `node_modules/`, or `dist/`
- Run `npm run check` before every commit

## Environment Setup

```bash
cp .env.example .env
# Edit .env with actual values
npm install
npm run check
```

## Key Decisions

- **TypeORM 1.x** — using DataSource API (not legacy createConnection)
- **ESM imports** — `import` syntax, compiled to CommonJS by NestJS/tsc
- **No `.env` reading** — always via ConfigService from @nestjs/config
- **Solar service** — fully implemented with suncalc
- **Growatt service** — real API integration via `growatt` npm package (SPF 5000 ES)
- **Coordinates** — .env SOLAR_LAT/SOLAR_LON take priority over Growatt API values
- **Deployment** — systemd service on VPS, GitHub Actions auto-deploy on push to main

## Deployment

Push to `main` triggers GitHub Actions → SSH to VPS → git pull → npm ci → build → restart systemd service.

- **VPS**: `/home/deploy/watt-view/`
- **Service**: `watt-view.service` (systemd)
- **Env file**: `/etc/watt-view/api.env` (managed manually on VPS)
- **nginx**: reverse proxy on port 3000

## macOS Widget Deployment Protocol

After ANY change to the macOS widget code, ALWAYS follow this loop:

```bash
# 1. Kill running instance
pkill -9 -f GrowattPlusMenuBar 2>/dev/null

# 2. Build
cd macos && bash build.sh

# 3. Remove quarantine + install to /Applications
xattr -cr GrowattPlusMenuBar.app
rm -rf /Applications/GrowattPlusMenuBar.app
mv GrowattPlusMenuBar.app /Applications/

# 4. Register with LaunchServices + reset Launchpad
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/GrowattPlusMenuBar.app
defaults write com.apple.dock ResetLaunchPad -bool true
killall Dock

# 5. Launch
open /Applications/GrowattPlusMenuBar.app

# 6. Verify
sleep 5 && pgrep -f GrowattPlusMenuBar && echo "Widget running"
ssh reflex "sudo tail -1 /var/log/nginx/access.log"  # should show GET /api/status → 200
```

**Critical notes:**
- `LSUIElement` must be `false` in Info.plist for the app to appear in Launchpad. `true` = menu-bar-only agent (hidden from Launchpad/Dock).
- Always `xattr -cr` after moving to /Applications (removes Gatekeeper quarantine).
- The `lsregister` + `ResetLaunchPad` + `killall Dock` sequence forces Launchpad to re-index.
- If widget shows "Connection Error", check: API token default in SolarAPIClient, ATS settings in Info.plist, port 80 nginx proxy.
