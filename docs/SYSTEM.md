# Watt View — Agentic System Map

## Product

A native macOS menu bar widget that monitors a Growatt off-grid solar installation in real time. The widget connects to a self-hosted NestJS API that polls the inverter every 5 minutes and presents battery status, solar production, consumption, and weather data directly in the macOS menu bar.

## Agent Architecture

Watt View was built using an **Orchestrator pattern** with specialized subagents. The orchestrator (main agent) plans, delegates, and synthesizes. Subagents execute atomic tasks independently and return structured results.

### Agent Types

| Agent Type | Role | When Used |
|------------|------|-----------|
| **Orchestrator** | Plans, delegates, synthesizes, makes architectural decisions | Every turn |
| **Researcher** | External web research, API docs, library comparison | Before implementation |
| **Engineer** | Code implementation, build verification, test writing | Feature implementation |
| **General** | Multi-step autonomous work (research + implement + verify) | Complex tasks |

### Context Strategy

Each subagent receives a **self-contained prompt** with:
- Clear objective and scope
- Exact field mappings and data structures (from research)
- Verification criteria ("npm run check must pass")
- Return format specification

Subagents do NOT share context with each other. The orchestrator synthesizes findings and passes relevant context forward.

## Orchestration Flow

### Phase 1: Research (4 parallel agents)

```
Orchestrator
├── Researcher-1: Growatt API (endpoints, auth, rate limits, libraries)
├── Researcher-2: Google Nest Mini integration (deprecated → pivoted)
├── Researcher-3: macOS MenuBar Swift architecture
└── Researcher-4: ShineWIFI-S datalogger + Modbus capabilities
```

**Why parallel**: Independent research domains, no dependencies. Wall-clock: ~60s vs ~4min sequential.

**Key findings that shaped the product**:
- OpenAPI V1 doesn't support SPF inverters → must use Legacy API
- Conversational Actions deprecated June 2023 → skip Google Home
- ShineWIFI-S has no local API → must use Growatt cloud
- MenuBarExtra (macOS 13+) is the modern approach → 80% less code than NSStatusItem

### Phase 2: Backend Scaffold (single engineer)

```
Engineer-1: Full NestJS scaffold (38 files)
├── All modules: growatt, solar, weather, readings, status, chat, auth
├── TypeORM, ESLint, Vitest configs
├── Solar service (fully implemented with suncalc)
├── Weather service (Open-Meteo client)
└── Verification: typecheck + lint + 10/10 tests
```

**Single engineer** because modules are tightly coupled (shared config, entity imports, module wiring). Splitting would create merge conflicts.

### Phase 3: API Integration (sequential)

```
Engineer-2: Growatt API integration (real data, field mapping)
Engineer-3: Status service (compose solar + weather + growatt)
Engineer-4: Auth guard + Swagger docs
```

**Sequential**: API integration depends on correct field mappings from real data dump. Auth depends on API being functional.

### Phase 4: macOS Widget (parallel with backend fixes)

```
General-1: macOS Swift MenuBar app (independent codebase)
Backend: circular dependency fix, TypeORM 1.x compatibility
```

**Parallel**: Widget is Swift, backend is TypeScript. No shared files.

## Parallelization Evidence

### Evidence 1: Initial Research (4 concurrent)

```
Spawned: researcher-1 (Growatt API)
Spawned: researcher-2 (Nest Mini)
Spawned: researcher-3 (macOS Swift)
Spawned: researcher-4 (ShineWIFI-S)
...
Completed: researcher-1 (9 turns)
Completed: researcher-3 (10 turns)
Completed: researcher-4 (11 turns)
Completed: researcher-2 (7 turns)
```

All 4 ran concurrently. Total wall-clock: ~60s.

### Evidence 2: Version Research + Auth Implementation

```
Spawned: researcher-5 (framework versions)
Spawned: engineer-3 (auth guard + swagger)
...
Both completed independently
```

### Evidence 3: macOS Widget + Backend Fixes

Widget (Swift) and backend fixes (TypeORM, circular dep) developed concurrently. Zero file conflicts.

## Autonomous Loops

### Loop 1: CJS Module Import Failure

| Step | Action |
|------|--------|
| ACT | Implement `import Growatt from 'growatt'` |
| VERIFY | Deploy to VPS via GitHub Actions |
| OBSERVE | `TypeError: growatt_1.default is not a constructor` |
| FIX | Add `esModuleInterop: true` to tsconfig.json |
| VERIFY | Deploy succeeds, API returns real data |

No human prompt between OBSERVE and FIX.

### Loop 2: Circular Module Dependency

| Step | Action |
|------|--------|
| ACT | Add GrowattModule import to ReadingsModule |
| VERIFY | Deploy to VPS |
| OBSERVE | `UndefinedModuleException: module at index [1] is undefined` |
| FIX | Apply `forwardRef()` to both modules + controller |
| VERIFY | Deploy succeeds |

### Loop 3: TypeORM 1.x Breaking Change

| Step | Action |
|------|--------|
| ACT | Use `findOne({ order: { recorded_at: 'DESC' } })` |
| VERIFY | Endpoint called |
| OBSERVE | `Error: You must provide selection conditions` |
| FIX | Replace with `find({ take: 1 })` |
| VERIFY | Endpoint returns correct data |

### Loop 4: macOS Widget — 3 Consecutive Fixes

| Step | Action |
|------|--------|
| ACT | Connect widget to VPS API |
| VERIFY | Widget shows "Connection Error" |
| OBSERVE | `apiToken` defaults to empty string → 401 |
| FIX | Add default token fallback in SolarAPIClient |
| VERIFY | nginx log: `GET /api/status` → 200 |
| OBSERVE | Widget shows "0%" on launch |
| FIX | Add `startAutoRefresh()` in model init |
| VERIFY | Data loads automatically on launch |
| OBSERVE | "1311 W Discharging" when actually charging |
| FIX | Invert sign convention (Growatt: neg=charging) |
| VERIFY | User confirms correct display |

**3 iterations, no human technical instructions between fixes.**

### Loop 5: Port 80 Proxy

| Step | Action |
|------|--------|
| ACT | Launch widget pointing to port 3000 |
| VERIFY | Connection timeout |
| OBSERVE | VPS cloud firewall blocks port 3000 |
| FIX | Add nginx proxy (port 80 → 3000), update widget URL |
| VERIFY | Widget connects and shows data |

## Deterministic Controls

| Control | Purpose |
|---------|---------|
| `npm run check` (typecheck + lint + test) | Every commit must pass |
| `.gitignore` (no .env, node_modules, dist) | Prevents secret leaks |
| API Token guard (Bearer) | No unauthenticated access |
| Cron `*/5 * * * *` | Prevents Growatt rate limiting |
| UPSERT on recorded_at | Idempotent imports |
| systemd `Restart=always` | Backend auto-recovery |

## Memory & Knowledge Systems

Watt View uses the **SCE (Smart Context Engine)** — a multi-backend memory and code intelligence system — for cross-session knowledge retention and semantic code search.

### SCE Memory (Graphiti backend)

The orchestrator saves architectural decisions, field mappings, and platform discoveries to a **Graphiti knowledge graph**. On subsequent sessions, the orchestrator queries this graph to retrieve prior context without re-deriving it.

**Concrete example — SPF 5000 ES field mapping preservation:**

```
Session 1 (research):
  → Dump script reveals: statusData.capacity = Battery SOC
  → Orchestrator saves to Graphiti: "capacity=batterySoc, ppv1=pvPower,
    batPower=negative means charging"

Session 2 (widget implementation):
  → Orchestrator queries Graphiti for "growatt field mapping"
  → Retrieves: "negative = charging, positive = discharging"
  → Passes to subagent prompt: "Battery power convention:
    negative=charging, positive=discharging"
  → Subagent implements BatteryIndicator with correct sign logic
```

Without this memory, the sign-convention bug would have required a manual debugging session. The knowledge graph made the correction automatic.

### Semantic Code Search (LightRAG backend)

When investigating codebase behavior without reading every file, the orchestrator uses semantic search over indexed code chunks:

```
Query: "how does the growatt poller save readings to database"

Results (ranked by semantic relevance):
  1. growatt.poller.ts (score 0.512) — @Cron handler calling
     growattService.getPlantData() then readingsService.create()
  2. ARCHITECTURE.md (score 0.502) — Mermaid sequence diagram
     showing Cron → GrowattService → API → ReadingService → DB
  3. growatt.module.ts (score 0.486) — Module wiring with
     forwardRef() for circular dependency
  4. readings.controller.ts (score 0.410) — REST endpoints
     with UPSERT import logic
```

This is used for: investigating unexpected behavior, understanding module wiring before making changes, and verifying that implementations match the architecture.

### Session Memory (checkpoint system)

MiMoCode maintains a **session checkpoint** that preserves:
- Active intent and next concrete action
- All directives (API version, rate limits, coordinate priority, etc.)
- Task tree with completion status
- All discovered knowledge (field mappings, AGP 9 breaking changes, etc.)
- Error log with fixes and commit hashes

The checkpoint is written automatically and read at session start, enabling context restoration after compaction or restart.

### Tools Used

| Tool | Backend | Purpose | Frequency |
|------|---------|---------|-----------|
| `sce_memory_save` | Graphiti | Persist decisions, mappings, conventions | Every significant discovery |
| `sce_memory_search` | Graphiti | Cross-session knowledge retrieval | Session start, after compaction |
| `sce_search_codebase` | LightRAG | Semantic code search by concept | When investigating codebase |
| `sce_code_architecture` | code-review-graph | Architecture communities | Available, not yet indexed |
| `sce_code_impact` | code-review-graph | Blast radius analysis | Available, not yet indexed |
| `memory search` | Session checkpoint | BM25 search over session notes | Context restoration |
| `memory read` | Session checkpoint | Full checkpoint read | Session start |

## Human Decisions

| Decision | Impact |
|----------|--------|
| Use Legacy API (not V1) | V1 doesn't support SPF inverters |
| Prioritize .env coordinates | Growatt forces city center, not real location |
| TypeORM 1.x | User's explicit choice for latest features |
| Port 80 via nginx | VPS firewall blocks 3000 |
| Skip Google Home | Platform deprecated June 2023 |
| suncalc over external API | Zero deps, local calculation |
| Scope to menu bar widget only | Focused product > half-baked multi-platform |
| No web frontend for demo | Native app story > generic dashboard |
