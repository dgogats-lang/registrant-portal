# Registrant Portal — Handoff v7

> **Session summary:** Profile page added. Users can now view their email and update their first/last name from a new /profile page, with a Profile nav link in the header.

---

## Current State

The app is fully working on the dev preview. All pages tested end-to-end in v6 remain intact. Profile page is new.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## What Was Done This Session

- **Profile page added** — `src/pages/profile.js`: shows email (read-only) and editable first/last name fields. Saves via PATCH to `/api/user/profile`. Shows inline success/error feedback.
- **`/api/user/profile` route added** — `src/pages/api/user/profile.js`: handles `GET` and `PATCH`. Verifies session cookie, guards against inactive users.
- **`updateUser` added to dataService** — `lib/dataService.js`: `updateUser(userId, { firstName, lastName })` updates the users table and returns the updated row.
- **Nav updated** — `src/components/Layout.js`: Profile link added between Events and Sign out.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `lib/dataService.js` | Added `updateUser` |
| `src/pages/api/user/profile.js` | New — GET + PATCH profile API |
| `src/pages/profile.js` | New — profile page |
| `src/components/Layout.js` | Added Profile nav link |

---

## Environment Variables

No new env vars added. Same as v6.

---

## Database — Current Schema

No schema changes. The `users` table already has `first_name` and `last_name` columns.

---

## Known Issues (carried from v6)

### Pending User Stuck State

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
- [ ] Seed more test events in Neon if needed

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
3. To continue in Cowork: open a new chat and say *"Read docs/handoff-v7.md — that's the current state. Here's what I want to do next: [your task]"*
4. To continue in Claude Code: run `claude` from the project folder and reference `docs/handoff-v7.md`
