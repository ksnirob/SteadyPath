# Steady Path

A production-shaped Progressive Web App for tracking OCD episodes, compulsions, ERP exercises, mood, triggers, journals, medications, habits, sleep, streaks, and recovery progress.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS with shadcn-style primitives
- Prisma ORM and PostgreSQL
- Auth.js with Prisma Adapter, credentials, and Google OAuth scaffold
- React Hook Form, Zod, TanStack Query
- Recharts and PWA support through next-pwa

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and auth secrets.

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the app:

```bash
npm run dev
```

## App Options

The app is organized around the main recovery workflow. On desktop, these options appear in the left sidebar. On mobile, the most-used options are in the bottom navigation and the rest are inside `More`.

- `Dashboard`: The daily overview. Use it to quickly see today's anxiety, current streak, ERP progress, recent episodes, recent triggers, journal activity, recovery trends, and the connected recovery workflow.
- `Calendar`: A monthly view of recovery activity. Use it to spot which days had check-ins, ERP work, episodes, or journal entries. Tap a day to open a detail modal.
- `Check-in`: A fast daily form for anxiety, mood, sleep, energy, and notes. Use it once or twice a day to build consistent trend data.
- `ERP`: Exposure and Response Prevention planning. Use `New exposure` to add your own exposure, use the suggested ERP actions to add standard practice items, then use `Start` or `Timer` to begin a session. `Pause` stops the timer without completing or saving the session; `Resume` continues it; `Complete session` saves it to ERP history, dashboard, calendar, and insights.
- `Episodes`: OCD episode logging. An episode means one OCD loop event: intrusive thought, anxiety, urge to perform a compulsion, and either doing or resisting the compulsion. Logged episodes update trigger counts, calendar activity, and anxiety trends.
- `Triggers`: A library of recurring triggers. Use `Add trigger` for a new feared situation or theme. Use `Log existing` to record the same trigger again with a new intensity/context. The displayed score is the average intensity from manual trigger logs and episode logs.
- `Insights`: Charts and summary statistics. Use it to review weekly anxiety, mood trends, trigger frequency, recovery score, streaks, and average anxiety.
- `Journal`: Daily reflection with offline autosave. Use it for gratitude, wins, challenges, and longer Markdown-friendly notes.
- `Settings`: App preferences and account controls. Use it for theme, exports, notification preferences, privacy, and account deletion.
- `Profile`: Personal account details. Use it for preferred name, email, and timezone.
- `Login`: Authentication screen for email/password or Google sign-in once production auth is enabled.
- `Offline`: Fallback page shown when the PWA cannot reach the network.

## OCD Recovery Model Used

The app follows a standard ERP workflow:

- Identify obsessions, triggers, compulsions, and avoidance patterns.
- Build a hierarchy from easier to harder exposures.
- Practice exposure on purpose while allowing uncertainty and anxiety to be present.
- Prevent the response: checking, washing, reassurance seeking, confessing, reviewing, repeating, neutralizing, or avoidance.
- Review completed sessions so progress is based on practice, not on whether anxiety disappeared instantly.

The app also treats lapses as data. If a compulsion happens, log the episode, notice the trigger, and use it to plan the next manageable ERP step.

## Current Behavior

- Dashboard, Calendar, Check-in, ERP, Episodes, Triggers, Insights, Journal, and Settings share the same local recovery store.
- New check-ins, episodes, trigger logs, ERP exposures, ERP sessions, and journal entries update connected views immediately.
- Data is stored locally in the browser as an offline-first stepping stone, not yet persisted to the database.
- The Prisma schema and API route foundation are ready for database-backed persistence.
- Route protection is controlled by `AUTH_REQUIRED`. Keep it `false` for local demo mode; set it to `true` when auth is configured.

## Notes

This is a working front-end and architecture scaffold, not a substitute for clinical care. For production use, connect PostgreSQL, enable authentication, persist ERP/triggers/journal/check-ins through API routes, and review privacy/security requirements before storing sensitive health data.
