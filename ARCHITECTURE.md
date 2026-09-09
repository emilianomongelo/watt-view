# Growatt Plus — Architecture

## System Overview

```mermaid
graph TB
    subgraph External ["☁️ External Services"]
        GC["🔌 Growatt Cloud API<br/><i>server.growatt.com</i><br/><i>Legacy ShinePhone API</i>"]
        OM["🌤️ Open-Meteo API<br/><i>api.open-meteo.com</i><br/><i>Free, no API key</i>"]
        LLM["🤖 LLM API<br/><i>OpenAI-compatible</i><br/><i>Xiaomi token</i>"]
    end

    subgraph VPS ["🖥️ VPS (24/7)"]
        subgraph NestJS ["NestJS Backend"]
            direction TB
            GP["📡 Growatt Poller<br/><i>@Cron every 5min</i><br/><i>Login + Fetch Data</i>"]
            RS["📊 Readings Service<br/><i>TypeORM + PostgreSQL</i>"]
            SS["☀️ Solar Service<br/><i>suncalc v2.0.2</i><br/><i>Sunrise/Sunset/Path</i>"]
            WS["🌦️ Weather Service<br/><i>Open-Meteo client</i><br/><i>GHI/DNI/DHI + Cloud</i>"]
            ST["📋 Status Service<br/><i>Composes all data</i>"]
            CS["💬 Chat Service<br/><i>LLM proxy + context</i>"]
        end

        PG[("🐘 PostgreSQL<br/><i>readings</i><br/><i>devices</i><br/><i>plant_config</i>")]
    end

    subgraph Clients ["📱 Clients"]
        MW["🖥️ macOS Widget<br/><i>Swift MenuBarExtra</i><br/><i>macOS 13+ (Ventura)</i>"]
        AA["📱 Android App<br/><i>Kotlin/Jetpack Compose</i><br/><i>Phase 2</i>"]
    end

    GC -->|"Legacy API<br/>user + MD5(password)"| GP
    GP -->|"Save readings<br/>every 5 min"| RS
    RS <-->|"Read/Write"| PG
    SS -->|"getTimes()<br/>getPosition()<br/>getDailySunPath()"| ST
    WS -->|"getCurrent()<br/>getHourlyForecast()<br/>getDailyForecast()"| ST
    RS -->|"Latest reading<br/>Historical data"| ST
    CS -->|"System prompt<br/>+ solar context"| LLM
    ST -->|"/api/status"| MW
    ST -->|"/api/status"| AA
    CS -->|"/api/chat"| AA
    OM -->|"REST API<br/>no auth needed"| WS

    style GC fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style OM fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style LLM fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style PG fill:#fce4ec,stroke:#c62828,stroke-width:2px
    style MW fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style AA fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,stroke-dasharray:5 5
```

## API Endpoints

```mermaid
graph LR
    subgraph REST API
        direction TB
        H["GET /api/health"]
        S["GET /api/status"]
        R["GET /api/readings"]
        D["GET /api/devices"]
        ST["GET /api/solar/today"]
        SP["GET /api/solar/path?date="]
        WC["GET /api/weather/current"]
        WF["GET /api/weather/forecast"]
        CH["POST /api/chat"]
        SW["GET /api/docs<br/><i>Swagger UI</i>"]
    end

    style H fill:#c8e6c9
    style S fill:#c8e6c9
    style R fill:#c8e6c9
    style D fill:#c8e6c9
    style ST fill:#fff9c4
    style SP fill:#fff9c4
    style WC fill:#bbdefb
    style WF fill:#bbdefb
    style CH fill:#ffe0b2
    style SW fill:#e1bee7
```

## Database Schema

```mermaid
erDiagram
    readings {
        serial id PK
        timestamptz recorded_at UK
        real battery_soc
        real battery_power
        real pv_power
        real load_power
        real daily_yield
    }

    devices {
        serial id PK
        varchar device_type
        varchar serial UK
        varchar model
        real capacity_wh
        jsonb metadata
    }

    plant_config {
        serial id PK
        varchar plant_id UK
        varchar plant_name
        real latitude
        real longitude
        varchar timezone
        int panel_count
        int panel_wp
        real battery_wh
    }

    readings ||--o{ devices : "measured_by"
    plant_config ||--o{ readings : "belongs_to"
```

## macOS Widget Architecture

```mermaid
graph TB
    subgraph MenuBar ["Menu Bar"]
        SL["StatusBarLabel<br/>☀️ 2.1kW 🔋 73%"]
    end

    subgraph Popover ["Popover Window (.window style)"]
        BI["BatteryIndicator<br/>Circular Progress Ring"]
        PF["PowerFlowView<br/>Production ↔ Consumption"]
        WF["Weather Widget<br/>☁️ 24°C 💨 12km/h"]
        FB["Footer Bar<br/>Last updated · Refresh · Settings"]
    end

    subgraph Data ["SolarDataModel"]
        API["SolarAPIClient<br/>URLSession async/await<br/>GET /api/status"]
        Timer["Auto-Refresh Timer<br/>every 5 minutes"]
    end

    SL -->|"click"| Popover
    BI --> Data
    PF --> Data
    Timer --> API
    API -->|"http://vps:3000"| NestJS["NestJS Backend"]

    style SL fill:#1a1a2e,stroke:#e94560,color:#fff
    style BI fill:#16213e,stroke:#0f3460,color:#fff
    style PF fill:#16213e,stroke:#0f3460,color:#fff
    style NestJS fill:#e8f5e9,stroke:#2e7d32
```

## Solar Position Calculations (suncalc)

```mermaid
graph LR
    subgraph Input
        LAT["Latitude<br/>-34.556960"]
        LON["Longitude<br/>-68.307736"]
        DATE["Date/Time"]
    end

    subgraph suncalc ["suncalc v2.0.2"]
        GT["getTimes()<br/>sunrise · sunset<br/>solarNoon · dawn · dusk<br/>goldenHour"]
        GP["getPosition()<br/>azimuth · altitude<br/>(radians)"]
        DSP["getDailySunPath()<br/>24 points<br/>dawn → dusk"]
    end

    subgraph Output
        SUNRISE["🌅 Sunrise<br/>06:45"]
        SUNSET["🌇 Sunset<br/>18:30"]
        PATH["📈 Sun Path<br/>azimuth + altitude<br/>per hour"]
        HOURS["⏱️ Daylight<br/>11.75 hours"]
    end

    LAT --> suncalc
    LON --> suncalc
    DATE --> suncalc
    GT --> SUNRISE
    GT --> SUNSET
    GT --> HOURS
    DSP --> PATH
```

## Data Flow — Polling Cycle

```mermaid
sequenceDiagram
    participant C as Cron (5min)
    participant G as GrowattService
    participant API as Growatt Cloud
    participant R as ReadingService
    participant DB as PostgreSQL
    participant S as StatusService
    participant W as WeatherService
    participant OM as Open-Meteo
    participant Client as macOS Widget

    loop Every 5 minutes
        C->>G: handlePoll()
        G->>API: GET /plant_info (Legacy API)
        API-->>G: battery_soc, pv_power, load_power
        G->>R: save(reading)
        R->>DB: INSERT INTO readings
    end

    Client->>S: GET /api/status (every 5min or manual)
    S->>DB: SELECT latest reading
    S->>S: getSolarTimes(lat, lng)
    S->>W: getCurrent(lat, lng)
    W->>OM: GET /v1/forecast
    OM-->>W: temp, cloud_cover, GHI, DNI
    S-->>Client: { battery, solar, weather, solar_times }
```

## Phased Roadmap

```mermaid
gantt
    title Growatt Plus — Development Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %Y

    section Phase 1 — MVP ✅
    Backend scaffold (NestJS)        :done, p1a, 2025-09-08, 1d
    macOS MenuBar widget             :done, p1b, 2025-09-08, 1d
    Growatt API integration          :active, p1c, 2025-09-09, 3d
    PostgreSQL setup + migrations    :p1d, after p1c, 2d
    Deploy to VPS                    :p1e, after p1d, 1d

    section Phase 2 — AI & Android
    AI Chat Agent (LLM integration)  :p2a, after p1e, 5d
    Android app (Kotlin/Compose)     :p2b, after p1e, 14d
    Android widget (4x1)             :p2c, after p2b, 3d
    Historical charts & analytics    :p2d, after p1e, 5d

    section Phase 3 — Direct Access
    USB-RS485 Modbus adapter         :p3a, after p2a, 2d
    Local Modbus polling (1-10s)     :p3b, after p3a, 5d
    Real-time dashboard              :p3c, after p3b, 3d

    section Phase 4 — Smart Home
    Google Home integration          :p4a, after p3c, 7d
    Home Assistant bridge            :p4b, after p4a, 3d
```

## Tech Stack Summary

```mermaid
mindmap
  root((Growatt Plus))
    Backend
      NestJS 12.0.1
      TypeScript 5.8.3
      TypeORM 1.1.1
      PostgreSQL
      suncalc 2.0.2
      Open-Meteo API
    macOS Widget
      Swift 6.3.3
      SwiftUI MenuBarExtra
      macOS 13+ Ventura
      URLSession async/await
    Android (Phase 2)
      Kotlin
      Jetpack Compose
      4x1 Widget
    Infrastructure
      VPS 24/7
      PostgreSQL
      Self-hosted
    Data Sources
      Growatt Legacy API
      Open-Meteo Weather
      suncalc Solar Position
```
