# Registrant Portal — Handoff v5

> **Session summary:** End-to-end magic link sign-in flow confirmed working on Vercel dev preview. All env vars set. Ready for event seeding and testing.

---

## Current State

The app is fully working on the dev preview. Magic link sign-in has been tested and confirmed end-to-end.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## What Was Fixed This Session

- **`RESEND_FROM` missing** — added `onboarding@resend.dev` to both `.env.local` and Vercel env vars. Required for Resend to send emails. Without a verified sending domain, `onboarding@resend.dev` works but can only send to the Resend account owner's email (`dgogats@gmail.com`).
- **`MAGIC_LINK_BASE_URL` pointed to production** — magic link emails were sending users to `registrant-portal.vercel.app` (main branch, old scaffold = 404). Fixed by adding a Preview-scoped `MAGIC_LINK_BASE_URL` pointing to the dev preview URL.
- **Sign-in confirmed working** — full flow tested: request link → email arrives → click link → verify page → dashboard.

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
| `MAGIC_LINK_BASE_URL` | `https://registrant-portal.vercel.app` (update if testing locally) |
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

## Resend Limitations (current)

Using `onboarding@resend.dev` as the sender without a verified domain means:
- Can only send to the Resend account owner's email (`dgogats@gmail.com`)
- Not suitable for real testers yet

To unlock sending to any address: verify a sending domain in Resend (Domains → Add Domain → add DNS records), then update `RESEND_FROM` to e.g. `noreply@yourdomain.com` in both `.env.local` and Vercel.

---

## Known Issue: Pending User Stuck State

If a user signs up but doesn't click their magic link before it expires (15 min), their account stays `pending`. They can't sign up again (duplicate email error) and can't log in (login only sends to `active` users). 

**Workaround:** Run this in the Neon SQL editor to manually activate them:
```sql
UPDATE users SET status = 'active' WHERE email = 'their@email.com';
```

**Proper fix (not yet built):** The signup route should detect a `pending` user and resend the magic link instead of rejecting them.

---

## What's Needed Next

### Before inviting real testers
- [ ] Verify a sending domain in Resend → update `RESEND_FROM` in `.env.local` and Vercel
- [ ] Seed test events in Neon SQL editor:
  ```sql
  INSERT INTO events (event_name, event_start_date, event_end_date) VALUES
    ('Spring Hiring Event', '2026-06-15', '2026-06-15'),
    ('Summer Career Fair', '2026-07-20', '2026-07-21');
  ```
- [ ] Test dashboard and events pages with real data
- [ ] Fix pending user stuck state in signup route (optional but good UX)

### When testing is complete
- [ ] Merge `dev` → `main` to promote to production URL
- [ ] Update `MAGIC_LINK_BASE_URL` production value if needed

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
2. Run `claude` to start Claude Code
3. Tell it: *"Read docs/handoff-v5.md — that's the current state. Here's what I want to do next: [your task]"*

To run locally: `npm run dev` → opens at `http://localhost:3000`  
Note: for local testing, update `MAGIC_LINK_BASE_URL` in `.env.local` to `http://localhost:3000`
