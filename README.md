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

For local development without login, keep:

```env
AUTH_REQUIRED="false"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Push the Prisma schema to the database and generate Prisma Client:

```bash
npx prisma db push
npm run prisma:generate
```

Use `npm run prisma:migrate` instead of `npx prisma db push` when you want migration files committed to the repo.

4. Start the app:

```bash
npm run dev
```

5. Optional: inspect the database in the browser:

```bash
npm run prisma:studio
```

Prisma Studio opens at `http://localhost:5555`.

## Vercel Prisma Postgres Setup

If you created a database in Vercel or Prisma Postgres, do not run `prisma bootstrap` for this project. The app already has a Prisma schema at `prisma/schema.prisma`.

1. In the Vercel database modal, copy the full connection string from `Or copy the connection string`.

2. Put it in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

Keep connection pooling on. The pooled URL is the right default for a deployed Next.js app.

3. Create/update the database tables:

```bash
npx prisma db push
```

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Add the same `DATABASE_URL` in Vercel:

Go to `Project Settings -> Environment Variables`, add `DATABASE_URL`, paste the same connection string, and redeploy the project.

6. Confirm it worked:

```bash
npm run prisma:studio
```

Open `http://localhost:5555`. After you save data in the app, the matching rows should appear in Prisma Studio automatically.

## App Options

The app is organized around the main recovery workflow. On desktop, these options appear in the left sidebar. On mobile, the most-used options are in the bottom navigation and the rest are inside `More`.

- `Dashboard`: The daily overview. Use it to quickly see today's anxiety, current streak, ERP progress, recent episodes, recent triggers, journal activity, recovery trends, and the connected recovery workflow.
- `Calendar`: A monthly view of recovery activity. Use it to spot which days had check-ins, ERP work, episodes, or journal entries. Tap a day to open a detail modal.
- `Check-in`: A fast daily form for anxiety, mood, sleep, energy, and notes. Use it once or twice a day to build consistent trend data.
- `ERP`: Exposure and Response Prevention planning. Use `New exposure` to add your own exposure and optionally choose which trigger the exposure practices. Use `Start` or `Timer` to begin a session. `Pause` stops the timer without completing or saving the session; `Resume` continues it; `Complete session` saves it to ERP history, dashboard, calendar, and insights.
- `Episodes`: OCD episode logging. An episode means one OCD loop event: intrusive thought, anxiety, urge to perform a compulsion, and either doing or resisting the compulsion. Logged episodes update trigger counts, calendar activity, and anxiety trends.
- `Triggers`: A library of recurring triggers. Use `Add trigger` for a new feared situation or theme. Use `Log existing` to record the same trigger again with a new intensity/context. Episode logs can also include a trigger. Use `Plan ERP` on a trigger card to create a practice item from that trigger. The displayed score is the average intensity from manual trigger logs and episode logs, not ERP sessions.
- `Insights`: Charts and summary statistics. Use it to review weekly anxiety, mood trends, trigger frequency, recovery score, streaks, and average anxiety.
- `Journal`: Daily reflection with offline autosave. Use it for gratitude, wins, challenges, and longer Markdown-friendly notes.
- `Settings`: App preferences and account controls. Use it for theme, exports, notification preferences, privacy, account deletion, and the recovery workflow reference.
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

In the app, triggers and ERP are connected for planning: a trigger can become an ERP hierarchy item. Trigger counts and average intensity remain separate, because those measure how often a trigger was logged through `Triggers` or `Episodes`. ERP sessions measure practice progress.

The app also treats lapses as data. If a compulsion happens, log the episode, notice the trigger, and use it to plan the next manageable ERP step.

## Current Behavior

- Dashboard, Calendar, Check-in, ERP, Episodes, Triggers, Insights, Journal, and Settings share the same database-backed recovery store.
- New check-ins, episodes, trigger logs, ERP exposures, ERP sessions, and journal entries update connected views immediately.
- Saved recovery data is loaded from Postgres through `/api/sync`.
- Every save, update, and delete writes the recovery state back to Postgres through `/api/sync`.
- If an older browser has recovery data in the legacy `steady-path-recovery-state` localStorage key, the app migrates it to Postgres once and removes that legacy local copy after a successful sync.
- The old static demo seed data has been removed. A fresh browser starts with empty recovery data.
- Route protection is controlled by `AUTH_REQUIRED`. Keep it `false` for local demo mode; set it to `true` when auth is configured.

## Automatic Database Sync

The app uses a database-first pattern:

- The UI hydrates saved recovery data from `GET /api/sync`.
- `saveRecoveryState` updates the current in-memory UI state and schedules a background `POST /api/sync`.
- `/api/sync` upserts a local user with email `local@steady-path.app`.
- The endpoint replaces that user's Postgres rows with the current recovery state.
- Clearing data in the app also clears the synced recovery rows for that local user.

For Vercel, set `DATABASE_URL` to the Vercel/Prisma Postgres connection string in Project Settings, then run `npx prisma db push` locally against that URL or redeploy after the schema is already pushed.

Synced tables:

- `OcdEpisode`
- `DailyCheckIn`
- `ErpExercise`
- `TriggerEvent`
- `JournalEntry`
- `User`

## Notes

This is a working front-end and architecture scaffold, not a substitute for clinical care. For production use, enable authentication, connect records to real users instead of the local demo user, and review privacy/security requirements before storing sensitive health data.
