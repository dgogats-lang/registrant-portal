# Registrant Portal

A web portal for registrants to view and manage their event registrations.

This is a proof of concept. **See [`/docs/handoff-v3.md`](./docs/handoff-v3.md) for the full design rationale, decision history, and open items.** That document is the source of truth for this project — read it first.

## Terminology

- **User** — anyone with a portal login (the `users` table).
- **Registrant** — a User who has registered for at least one event.
- **Registration** — the record of one User signing up for one Event.

## Stack

- **Frontend:** React + Tailwind CSS (v4)
- **Backend:** Vercel API Routes (serverless)
- **Auth:** Magic links via Resend + JWT
- **Data (POC):** Neon Postgres
- **Data (Production):** Quickbase API — same `dataService.js` interface, different branch

## Local setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in real values
3. Apply `schema.sql` to your Neon database
4. `npm run dev`

## Branch & deployment model

- `dev` branch → Vercel preview URL (testers use this)
- `main` branch → production URL

## Status

Pre-build. See "Open Items for the Next Chat" in `/docs/handoff-v3.md` for what's next.
