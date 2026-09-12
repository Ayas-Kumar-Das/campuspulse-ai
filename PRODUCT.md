# CampusPulse AI
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
Next.js App Router and TypeScript, as supplied in the user brief. User selected building directly in code.
## Users
College students managing notices, eligibility and deadlines; administrators publishing campus opportunities.
## Product Purpose
Turn campus notices into personalized, explainable actions.
## Capabilities and Constraints
Hackathon website with seeded synthetic notices, deterministic eligibility, persistent local tasks, calendar export, student switching and notice review. Live provider credentials and university integrations are not supplied. Demo assistant must identify its local retrieval behavior.
## Brand Commitments
Light-first, restrained indigo, premium productivity interface. Clarity and action before decoration. No Sites skills.
## Evidence on Hand
User supplied CampusPulse_AI_Implementation_Plan.md and frontend style brief. All seeded institutions and notices are demonstration content.
## Product Principles
Prioritize deadlines. Explain eligibility with evidence. Make every action useful. Label uncertainty.

## Decision engine upgrade
The user requested all new capabilities from the Final 90-Minute Plan plus priority tasks, scores and resume upload. The existing Next.js application remains. Twelve synthetic notices power deterministic impact scores, workflow dependencies, time-budget focus plans, consequences and certification simulations. Student-facing analysis and assistant endpoints support optional server-side Gemini structured output with explicit local fallback. No authentication or database is added. Resume files are kept per demo student in browser IndexedDB, not sent to employers or AI. Career goal and certifications extend the profile; existing features are preserved.

## College mail and calendar extension
The student workspace includes a synthetic college inbox with search, unread filtering and locally persisted read/starred state. A selected message can be analyzed through the existing notice-analysis endpoint, using configured Gemini output when available and the documented local fallback otherwise, then converted into an opportunity and action plan. The inbox is demonstration content and is not connected to a university mailbox. Calendar agenda items are ordered chronologically and offer prefilled Google Calendar links; opportunity details retain downloadable calendar reminders and also expose the Google Calendar handoff.
