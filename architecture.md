# Implementation architecture

The delivered scope is a locally runnable demo with lightweight Next.js API routes. Next.js App Router serves the website and a client application owns shared browser state. Typed notices and profiles feed a deterministic eligibility and impact evaluator. Analyzer/admin review update the same notice collection consumed by student views. Task and workflow keys include the student's name. State persists under `campuspulse-v1` in localStorage; per-student resume blobs use IndexedDB.

The adapter boundary for a future backend is the typed `Notice` and `Profile` data in `lib/data.ts`. Replace local storage with authenticated queries and mutations; keep eligibility rules independently testable. Do not expose real student information through this demo, which has no authentication boundary.

Date labels use IST and a documented fixed demo clock. ICS export uses UTC timestamps. Fonts ship with the application. `/api/analyze` supports optional server-side Responses structured output and a conservative local fallback; `/api/query` optionally explains deterministic decision facts. Provider keys stay server-side. Resume files never leave the browser.

`lib/intelligence.ts` owns weighted impact, dependency state, focus selection and certification simulations. `lib/analyzer.ts` validates extraction and action dependencies. `lib/query.ts` handles narrow assistant intents. Focus selection protects urgent ready actions and greedily fits the budget; unknown eligibility cannot unlock workflow steps. Undoing a prerequisite removes completed descendants.
