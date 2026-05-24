# Registrant Portal — Handoff v4

> **Session summary:** Full app built and deployed. Login page is live. Blocked only on Resend sending domain before end-to-end magic link flow can be tested.

---

## Current State

The app is fully built and deployed to Vercel. The login page is live at:

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app`

The `main` branch still has the old scaffold (no app pages). All the real code is on `dev`. Once testing is complete, merge `dev` → `main` to promote to production.

---

## What Was Built This Session

### Infrastructure
- GitHub repo: `https://github.com/dgogats-lang/registrant-portal` (public)
- Neon Postgres project: "Registrants Portal", US East 1 — schema applied, tables exist, no data yet
- Resend account: API key set, **sending domain not yet verified** (blocked on client org's domain)
- Vercel project: connected to GitHub, framework set to Next.js, `dev` deploys as preview

### App Code (all on `dev` branch)
- **Next.js 16** with Pages Router, JavaScript, Tailwind CSS v4
- **`lib/db.js`** — Neon serverless SQL connection
- **`lib/dataService.js`** — all DB functions behind `DATA_SOURCE=neon` switch with Quickbase stubs
- **`lib/auth.js`** — JWT helpers with `type` claim (`"magic"` vs `"session"`), `generateMagicToken()`
- **`lib/mailer.js`** — `sendMagicLink()` via Resend, requires `RESEND_FROM` env var
- **API routes:** `request-link`, `signup`, `verify-token`, `signout`, `registrations`
- **Pages:** login, signup, verify (magic-link interstitial), dashboard, events
- **`src/components/Layout.js`** — shared nav

---

## Environment Variables

### `.env.local` (local development) — all set
| Variable | Status |
|----------|--------|
| `DATA_SOURCE` | `neon` |
| `DATABASE_URL` | ✅ Set |
| `JWT_SECRET` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `RESEND_FROM` | ❌ Blank — needs verified sending domain |
| `MAGIC_LINK_BASE_URL` | ✅ `https://registrant-portal.vercel.app` |
| `SIGNUP_INVITE_CODE` | ✅ `portaltest` |

### Vercel environment variables — partially set
| Variable | Status |
|----------|--------|
| `DATA_SOURCE` | ✅ Set |
| `DATABASE_URL` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `JWT_SECRET` | ✅ Set |
| `MAGIC_LINK_BASE_URL` | ✅ Set |
| `SIGNUP_INVITE_CODE` | ✅ Set |
| `RESEND_FROM` | ❌ Not set — add when sending domain is verified |

---

## What's Needed to Test End-to-End

### Blocking
- **`RESEND_FROM`** — the verified sending email address (e.g. `noreply@clientdomain.com`). Requires the client org to add DNS records to their domain in Resend. Once done, add `RESEND_FROM` to both `.env.local` and Vercel environment variables, then redeploy.

### Non-blocking but needed before real use
- **Seed events in Neon** — the events table is empty. Go to Neon SQL editor and insert some test events, or ask Claude Code to write a seed script. Example:
  ```sql
  INSERT INTO events (event_name, event_start_date, event_end_date) VALUES
    ('Spring Hiring Event', '2026-06-15', '2026-06-15'),
    ('Summer Career Fair', '2026-07-20', '2026-07-21');
  ```
- **Merge `dev` → `main`** once testing is complete to promote to production

---

## Remaining Open Items

- [ ] Get client org's domain DNS records added to Resend → set `RESEND_FROM`
- [ ] Seed test events in Neon SQL editor
- [ ] Test full signup flow: go to `/signup`, use invite code `portaltest`, check email for magic link
- [ ] Test login flow: go to `/login`, enter email, check for magic link
- [ ] Review dashboard and events pages with real data
- [ ] Merge `dev` → `main` to push to production URL
- [ ] Eventually: connect real Quickbase data by implementing Quickbase branch in `dataService.js`

---

## Key URLs & Accounts

| Service | URL / Detail |
|---------|-------------|
| GitHub repo | `https://github.com/dgogats-lang/registrant-portal` |
| Vercel project | `https://vercel.com/david-g-projects1/registrant-portal` |
| Neon database | neon.tech — project "Registrants Portal" |
| Resend | resend.com — domain verification pending |
| Live preview | `https://registrant-portal-git-dev-david-g-projects1.vercel.app` |

---

## How to Resume Development

1. Open Terminal, `cd "/Users/dgogats/Documents/Claude/Projects/Registrant Portal"`
2. Run `claude` to start Claude Code
3. Tell it: *"Read docs/handoff-v4.md — that's the current state. Here's what I want to do next: [your task]"*

To run locally: `npm run dev` → opens at `http://localhost:3000`
