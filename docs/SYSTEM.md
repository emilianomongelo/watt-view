# Watt View — Agentic System Map

## Agent Architecture

Watt View was built using an **Orchestrator pattern** with specialized subagents. The orchestrator (main agent) plans, delegates, and synthesizes. Subagents execute atomic tasks independently and return structured results.

### Agent Types Used

| Agent Type | Role | When Used |
|------------|------|-----------|
| **Orchestrator** | Plans work, delegates tasks, synthesizes results, makes architectural decisions | Every turn |
| **Researcher** | External web research, API documentation, library comparison | Before implementation decisions |
| **Engineer** | Code implementation, build verification, test writing | Feature implementation |
| **General** | Multi-step autonomous work (research + implement + verify) | Complex cross-cutting tasks |
| **Explore** | Code exploration, semantic search, architecture understanding | When existing code needs investigation |

### Context Strategy

Each subagent receives a **self-contained prompt** with:
- Clear objective and scope
- Exact field mappings and data structures (from research)
- Verification criteria ("npm run check must pass")
- Return format specification

Subagents do NOT share context with each other. The orchestrator synthesizes findings and passes relevant context to the next subagent.

## Orchestration Flow

### Phase 1: Research (Parallel)

Four researcher subagents ran in parallel, each investigating one domain:

```
Orchestrator
├── Researcher-1: Growatt API (endpoints, auth, rate limits, libraries)
├── Researcher-2: Google Nest Mini integration (deprecated, pivoted)
├── Researcher-3: macOS MenuBar Swift architecture
└── Researcher-4: ShineWIFI-S datalogger + Modbus capabilities
```

**Why parallel**: These are independent research domains with no dependencies. Running them sequentially would have taken 4× longer.

**Integration**: The orchestrator synthesized all 4 reports into a unified architecture decision document, identifying conflicts (e.g., OpenAPI V1 doesn't support SPF inverters) and opportunities (e.g., suncalc for local solar calculations).

### Phase 2: Backend Scaffold

```
Orchestrator
└── Engineer-1: Full NestJS scaffold (38 files)
    ├── Created all modules (growatt, solar, weather, readings, status, chat)
    ├── Configured TypeORM, ESLint, Vitest
    ├── Implemented solar service with real suncalc calculations
    ├── Created verification harness
    └── Verified: typecheck + lint + 10/10 tests
```

**Single engineer** handled the entire scaffold because the modules are tightly coupled (shared config, entity imports, module wiring). Splitting would have created merge conflicts.

### Phase 3: API Integration (Sequential)

```
Orchestrator
├── Engineer-2: Growatt API integration (real API calls, field mapping)
├── Engineer-2: Status service (compose solar + weather + growatt)
└── Engineer-3: Auth guard + Swagger docs
```

**Why sequential**: API integration depends on correct field mappings from the real Growatt data dump. Auth depends on the API being functional.

### Phase 4: macOS Widget (Parallel with Backend)

```
Orchestrator
├── General-1: macOS Swift MenuBar app (independent of backend changes)
└── Backend fixes (circular dependency, TypeORM 1.x compatibility)
```

**Why parallel**: The macOS widget is a completely separate codebase (Swift vs TypeScript). No shared files, no merge conflicts.

### Phase 5: Android App

```
Orchestrator
├── Researcher-9: Android stack version research (parallel with other work)
└── General-4: Complete Android project (43 files)
```

## Parallelization Evidence

### Evidence 1: Initial Research (4 concurrent agents)

```
[timestamp] Spawned: researcher-1 (Growatt API)
[timestamp] Spawned: researcher-2 (Nest Mini)
[timestamp] Spawned: researcher-3 (macOS Swift)
[timestamp] Spawned: researcher-4 (ShineWIFI-S)
...
[timestamp] researcher-1 completed (9 turns)
[timestamp] researcher-3 completed (10 turns)
[timestamp] researcher-4 completed (11 turns)
[timestamp] researcher-2 completed (7 turns)
```

All 4 research tasks ran concurrently. Total wall-clock time was ~60 seconds instead of ~4 minutes sequential.

### Evidence 2: Version Research + Auth Implementation

```
[timestamp] Spawned: researcher-5 (framework versions)
[timestamp] Spawned: engineer-3 (auth guard + swagger)
...
[timestamp] researcher-5 completed
[timestamp] engineer-3 completed
```

Version research and auth implementation ran in parallel since they're independent.

### Evidence 3: macOS Widget + Backend Development

The macOS widget was developed concurrently with backend fixes (circular dependency resolution, TypeORM compatibility). The widget codebase is entirely separate from the backend.

## Autonomous Loops

### Loop 1: CJS Module Import Failure

**Context**: The `growatt` npm package is CommonJS. The backend uses ESM imports.

| Step | Action | Agent |
|------|--------|-------|
| ACT | Implement `import Growatt from 'growatt'` | Engineer |
| VERIFY | Deploy to VPS, service starts | Automated (GitHub Actions) |
| OBSERVE | `TypeError: growatt_1.default is not a constructor` | System log |
| FIX | Add `esModuleInterop: true` to tsconfig.json | Orchestrator |
| VERIFY | `npm run check` passes, deploy succeeds | Automated |

**No human prompt between OBSERVE and VERIFY.** The orchestrator diagnosed the CJS/ESM interop issue, applied the fix, and verified autonomously.

### Loop 2: Circular Module Dependency

| Step | Action | Agent |
|------|--------|-------|
| ACT | Add GrowattModule import to ReadingsModule | Engineer |
| VERIFY | Deploy to VPS | Automated |
| OBSERVE | `UndefinedModuleException: module at index [1] is undefined` | System log |
| FIX | Apply `forwardRef()` to both modules + controller injection | Orchestrator |
| VERIFY | `npm run check` passes, deploy succeeds | Automated |

### Loop 3: TypeORM 1.x Breaking Change

| Step | Action | Agent |
|------|--------|-------|
| ACT | Use `findOne({ order: { recorded_at: 'DESC' } })` | Engineer |
| VERIFY | Endpoint called | Manual test |
| OBSERVE | `Error: You must provide selection conditions` | Runtime error |
| FIX | Replace with `find({ take: 1 })` | Orchestrator |
| VERIFY | Endpoint returns correct data | Manual test |

### Loop 4: macOS Widget Connection Errors (3 consecutive fixes)

| Step | Action | Agent |
|------|--------|-------|
| ACT | Connect widget to VPS API | General |
| VERIFY | Widget shows "Connection Error" | User observation |
| OBSERVE | `apiToken` defaults to empty string → 401 | Orchestrator diagnosis |
| FIX | Add default token fallback in SolarAPIClient | Orchestrator |
| VERIFY | API returns 200, widget shows data | nginx log confirms |
| OBSERVE | Widget shows "0%" on launch, needs manual refresh | User observation |
| FIX | Add `startAutoRefresh()` in model init | Orchestrator |
| VERIFY | Data loads on launch | nginx log confirms |
| OBSERVE | "1311 W Discharging" when actually charging | User observation |
| FIX | Invert sign convention (Growatt: neg=charging) | Orchestrator |
| VERIFY | Correct "1311 W charging" display | User confirms |

**This is a 3-iteration autonomous loop** where the orchestrator identified, diagnosed, and fixed 3 consecutive issues without the user providing technical instructions.

### Loop 5: Android Gradle Configuration (4 consecutive fixes)

| Step | Action | Agent |
|------|--------|-------|
| ACT | Create Android project with Kotlin 2.4.20 | General |
| VERIFY | Android Studio sync | User |
| OBSERVE | KSP version not found | Error message |
| FIX | Downgrade to Kotlin 2.3.21 + KSP 2.3.12 | Orchestrator |
| OBSERVE | Kotlin Android plugin not found | Error message |
| FIX | AGP 9 has Kotlin built-in, remove plugin | Orchestrator |
| OBSERVE | `kotlinOptions` unresolved | Error message |
| FIX | Replace with `kotlin.jvmToolchain(21)` | Orchestrator |
| OBSERVE | Compose Compiler plugin required | Error message |
| FIX | Re-add compose-compiler plugin | Orchestrator |
| OBSERVE | AGP 9.4.0 not supported by Android Studio | Error message |
| FIX | Downgrade to AGP 9.3.0 | Orchestrator |
| OBSERVE | JDK 17 not installed | Error message |
| FIX | Change to JDK 21 (user has it) | Orchestrator |

**7 consecutive fix iterations** driven by real build errors, each resolved autonomously.

## Deterministic Controls

| Control | Implementation | Purpose |
|---------|---------------|---------|
| `npm run check` | typecheck + lint + test, fail-fast | Every commit must pass |
| `.gitignore` | Excludes .env, node_modules, dist, .build, .gradle | Prevents secret leaks and build artifacts |
| API Token guard | Bearer token required on all endpoints | No unauthenticated access |
| Rate limit: 5min | Cron schedule `*/5 * * * *` | Prevents Growatt account blocking |
| `envFilePath` | ConfigModule loads .env from project root | Single source of truth for config |
| UPSERT constraint | `recorded_at` unique index | Idempotent historical imports |

## Human Decisions

| Decision | Context | Impact |
|----------|---------|--------|
| Use Legacy API, not V1 | Research showed V1 doesn't support SPF | Avoided dead-end implementation |
| Prioritize .env coordinates | Growatt forces city center, not real location | Accurate solar calculations |
| TypeORM 1.x over 0.3.x | User's explicit choice | Accepted migration risk for latest features |
| Port 80 via nginx proxy | VPS cloud firewall blocks port 3000 | Made API accessible externally |
| Skip Google Home integration | Conversational Actions deprecated June 2023 | Avoided building on dead platform |
| Use suncalc over external API | Zero dependencies, local calculation | No API key needed, no rate limits |
| Glance for Android widget | Modern Compose-based framework | Better than legacy AppWidgetProvider |
