# Watt View — Demo Video Voiceover Script

**Total: 3 minutes (180 seconds)**
**Language: English**
**Tone: Confident, technical but accessible, engineer-to-engineer**

---

## PART 1: WHAT WE BUILT (90 seconds)

### [0:00 - 0:10] Opening / Problem

> This is Watt View — a native macOS menu bar widget that monitors my off-grid solar installation in real time.
>
> I built it because the official ShinePhone app logs me out every few minutes. Completely unusable for continuous monitoring.

### [0:10 - 0:25] Widget in Menu Bar

> Here's the widget, right here in my menu bar. I can see my battery is at 87 percent, and my panels are producing 1.7 kilowatts right now. That's real data from a real Growatt SPF 5000 ES inverter in Mendoza, Argentina.
>
> It updates every 5 minutes automatically. No login, no session timeout, no app to keep open.

### [0:25 - 0:45] Popover Walkthrough

> When I click it, I get a detailed popover. The battery indicator shows a circular progress ring — green when above 50 percent, orange between 20 and 50, red below 20.
>
> Right now it's charging at 1.3 kilowatts. My panels are producing more than the house is consuming, so the excess goes to the battery.
>
> Below that, I see the current weather — 18 degrees, clear sky, 3 percent cloud cover. That's from Open-Meteo, completely free, no API key needed.
>
> And here at the bottom, the last refresh time, a manual refresh button, and settings.

### [0:45 - 1:05] Settings + Configuration

> In settings, I can change the API URL, the authentication token, and the refresh interval. Everything is stored in UserDefaults.
>
> The backend is a NestJS API running 24/7 on my VPS. It polls the Growatt cloud every 5 minutes and stores the readings in PostgreSQL. I imported 10,000 historical readings going back to August — the day I installed the system.

### [1:05 - 1:20] Swagger + API

> The API has full Swagger documentation. Here's the status endpoint — it returns solar position data, weather with solar radiation values, and live inverter data all in one call.
>
> All endpoints are protected with a Bearer token. The widget sends it automatically.

### [1:20 - 1:30] Transition

> Now let me show you how this was built — not just the product, but the engineering system behind it.

---

## PART 2: HOW WE BUILT IT (90 seconds)

### [1:30 - 1:42] Orchestrator Pattern

> I used an orchestrator pattern with specialized sub-agents. The orchestrator plans, delegates, and synthesizes. Each sub-agent gets a self-contained prompt with clear objectives and verification criteria.
>
> Three agent types: Researchers for external investigation, Engineers for implementation, and General-purpose agents for complex multi-step tasks.

### [1:42 - 1:56] Parallel Research

> The first thing I did was run four research agents in parallel. One investigated the Growatt API — and found that the official V1 API doesn't support my inverter model. Another checked Google Home integration and discovered the platform was deprecated in 2023. A third researched the macOS MenuBar architecture. And a fourth looked into the datalogger hardware.
>
> Four independent investigations, running concurrently. Sixty seconds of wall-clock time instead of four minutes.

### [1:56 - 2:18] Autonomous Loop

> Here's where it gets interesting. The engineering agent implemented the Growatt API client, but when it deployed, the service crashed. The error: "not a constructor." The growatt npm package is CommonJS, and the project uses ESM imports.
>
> No human prompt was needed. The orchestrator diagnosed the issue, added the esModuleInterop flag to the TypeScript config, re-deployed, and verified it worked. That's an autonomous loop: act, verify, observe a problem, fix, verify again.
>
> We had five of these loops across the project — circular dependencies, TypeORM breaking changes, macOS widget connection errors, each one resolved without human intervention.

### [2:18 - 2:36] Verification Harness

> Every change goes through a verification harness: TypeScript type checking, ESLint, and 23 unit tests. If any of these fail, the commit doesn't happen.
>
> GitHub Actions deploys automatically on push to main. The agent runs the harness locally, and only pushes when everything is green.

### [2:36 - 2:50] Real Hardware, Real Data

> This isn't a mock-up. The API is connected to a real Growatt SPF 5000 ES inverter with 6 solar panels and a lithium battery in Mendoza, Argentina. The coordinates in the solar calculations are my actual GPS location, not a city center approximation.
>
> Every 5 minutes, real power data flows in: battery state of charge, PV production, house consumption, battery charge or discharge rate.

### [2:50 - 3:00] Closing

> Watt View. A native macOS widget built by an orchestrated system of agents. Real hardware. Real data. Real engineering.
>
> The code is on GitHub. Thank you.

---

## Production Notes

- **Voice**: Clear, measured pace. Not rushed.
- **Pauses**: Natural pauses between sections (1-2 seconds).
- **Emphasis words**: "real data", "autonomous loop", "no human prompt", "10,000 historical readings", "five loops".
- **Screen sync**: Match the voiceover to what's visible on screen at each timestamp.
- **Background music**: Optional, low-volume ambient/tech. Nothing distracting.
