# Registrant Portal — Handoff v6

> **Session summary:** Full sign-in flow working end-to-end. Date display fixed. Registration status field added to DB, schema, and dashboard with colour-coded badges.

---

## Current State

The app is fully working on the dev preview. Magic link sign-in, signup, dashboard, and events pages have all been tested.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## What Was Done This Session

- **Sign-in unblocked** — `RESEND_FROM=onboarding@resend.dev` added to `.env.local` and Vercel. Magic link flow confirmed working end-to-end.
- **`MAGIC_LINK_BASE_URL` fixed** — Preview-scoped env var added pointing to dev preview URL so magic links land on the right deployment.
- **Date timezone bug fixed** — `formatDate()` in `events.js` and `dashboard.js` was showing dates one day early for users behind UTC. Fixed by adding `timeZone: 'UTC'` to `toLocaleDateString`.
- **`registration_status` field added** — New column on the `registrations` table with values: `Accepted`, `Pending Approval`, `Denied`, `Cancelled`, `Duplicate`. Default is `Pending Approval`. Colour-coded badge now displays on the dashboard next to each registration.
- **Query fix** — `getEventsByUser` was not selecting `registration_status` from the registrations table. Fixed to include it.

---

## Environment Variables

### `.env.local` (local development) — all set
| Variable | Value |
|----------|-------|
| `DATA_SOURCE` | `neon` |
| `DATABASE_URL` | ✅ Set |
| `JWT_SECRET` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `RESEND_FROM` | `onboarding@resend.dev` (test only — swap when domain verified) |
| `MAGIC_LINK_BASE_URL` | `https://registrant-portal.vercel.app` (update to `http://localhost:3000` for local testing) |
| `SIGNUP_INVITE_CODE` | `portaltest` |

### Vercel environment variables — all set
| Variable | Environment | Value |
|----------|-------------|-------|
| `DATA_SOURCE` | All | `neon` |
| `DATABASE_URL` | All | ✅ Set |
| `RESEND_API_KEY` | All | ✅ Set |
| `JWT_SECRET` | All | ✅ Set |
| `RESEND_FROM` | All | `onboarding@resend.dev` |
| `MAGIC_LINK_BASE_URL` | Production | `https://registrant-portal.vercel.app` |
| `MAGIC_LINK_BASE_URL` | Preview | `https://registrant-portal-git-dev-david-g-projects1.vercel.app` |
| `SIGNUP_INVITE_CODE` | All | `portaltest` |

---

## Database — Current Schema

### `registrations` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `user_id` | FK → users | |
| `event_id` | FK → events | |
| `registration_status` | TEXT | `Accepted`, `Pending Approval`, `Denied`, `Cancelled`, `Duplicate`. Default: `Pending Approval` |
| `date_created` | TIMESTAMPTZ | |

### `events` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `event_name` | TEXT | |
| `event_start_date` | DATE | |
| `event_end_date` | DATE | nullable |

---

## Resend Limitations (current)

Using `onboarding@resend.dev` without a verified domain means magic links can only be sent to `dgogats@gmail.com` (the Resend account owner). Not suitable for real testers yet.

To unlock: verify a sending domain in Resend → update `RESEND_FROM` in `.env.local` and Vercel.

---

## Known Issue: Pending User Stuck State

If a user signs up but the magic link expires before they click it, their account stays `pending`. They can't sign up again and can't log in.

**Workaround:** Run in Neon SQL editor:
```sql
UPDATE users SET status = 'active' WHERE email = 'their@email.com';
```

**Proper fix (not yet built):** Signup route should detect a `pending` user and resend the magic link.

---

## What's Next

### Before inviting real testers
- [ ] Verify a sending domain in Resend → update `RESEND_FROM`
- [ ] Fix pending user stuck state in signup route
- [ ] Seed more test events in Neon if needed:
  ```sql
  INSERT INTO events (event_name, event_start_date, event_end_date) VALUES
    ('Spring Hiring Event', '2026-06-15', '2026-06-15'),
    ('Summer Career Fair', '2026-07-20', '2026-07-21');
  ```
- [ ] Full review of dashboard and events pages with real data

### When testing is complete
- [ ] Merge `dev` → `main` to promote to production URL

### Eventually (production)
- [ ] Implement Quickbase branch in `dataService.js`
- [ ] Set up Azure Static Web Apps + Azure Functions
- [ ] Set `DATA_SOURCE=quickbase` in production env vars

---

## Key URLs & Accounts

| Service | URL / Detail |
|---------|-------------|
| GitHub repo | `https://github.com/dgogats-lang/registrant-portal` |
| Vercel project | `https://vercel.com/david-g-projects1/registrant-portal` |
| Neon database | neon.tech — project "Registrants Portal" |
| Resend | resend.com — domain verification pending |
| Live preview (dev) | `https://registrant-portal-git-dev-david-g-projects1.vercel.app` |
| Production (main) | `https://registrant-portal.vercel.app` — old scaffold, not ready |

---

## How to Resume Development

1. Open Terminal, `cd "/Users/dgogats/Documents/Claude/Projects/Registrant Portal"`
2. To run locally: `npm run dev` → `http://localhost:3000` (update `MAGIC_LINK_BASE_URL` in `.env.local` to `http://localhost:3000` first)
3. To continue in Cowork: open a new chat and say *"Read docs/handoff-v6.md — that's the current state. Here's what I want to do next: [your task]"*
4. To continue in Claude Code: run `claude` from the project folder and reference `docs/handoff-v6.md`
