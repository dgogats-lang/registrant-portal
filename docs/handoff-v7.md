# Registrant Portal — Handoff v7

> **Session summary:** Profile page added (name only). Avatar dropdown menu replaces the old Profile nav link and Sign out button. Organization is stored per-registration (not on the user profile) and displayed on the dashboard alongside each event.

---

## Current State

The app is fully working on the dev preview. All pages tested end-to-end in v6 remain intact.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## ⚠️ Migration Required

Run this in the Neon SQL editor before deploying:

```sql
ALTER TABLE registrations ADD COLUMN organization TEXT;
```

> If you previously ran `ALTER TABLE users ADD COLUMN organization TEXT;` from an earlier draft this session, that column is now unused and harmless — you can leave it or drop it with `ALTER TABLE users DROP COLUMN organization;`.

---

## What Was Done This Session

- **Profile page added** — `src/pages/profile.js`: email (read-only), editable first name and last name. Saves via PATCH to `/api/user/profile`.
- **`/api/user/profile` route added** — handles GET and PATCH, session-protected.
- **`updateUser` added to dataService** — updates `first_name` and `last_name` on the users table.
- **Avatar dropdown menu** — `src/components/Layout.js` rebuilt. Profile and Sign out live in a dropdown triggered by a user-initials avatar button top-right. Shows user's name + email in the dropdown header.
- **Organization moved to registrations** — org is per-registration (mirrors Quickbase reality). `organization TEXT` column added to the `registrations` table. `getEventsByUser` now selects it. Dashboard shows org under the event date when present.
- **Pages updated** — `dashboard.js`, `events.js`, `profile.js` all pass `user` to Layout for the avatar initials.

### Architecture decision: organization

Organization comes from Quickbase and is tied to each registration — a user could represent different orgs across events. Rather than storing a single org on the user profile (which would diverge from QB), org lives on the `registrations` table and is displayed per-event on the dashboard. If a canonical "preferred org" is needed in future, the right approach is to derive it from registrations at the point the Quickbase integration is built.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `schema.sql` | `organization TEXT` added to registrations (not users) |
| `lib/dataService.js` | Added `updateUser`; `getEventsByUser` now selects `r.organization` |
| `src/pages/api/user/profile.js` | New — GET + PATCH profile API (name only) |
| `src/pages/profile.js` | New — profile page (first name, last name) |
| `src/components/Layout.js` | Rebuilt with avatar dropdown menu |
| `src/pages/dashboard.js` | Passes `user` to Layout; shows org per registration |
| `src/pages/events.js` | Passes `user` to Layout; user added to getServerSideProps |

---

## Environment Variables

No new env vars. Same as v6.

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
- [ ] **Run the `organization` column migration in Neon** (see above)
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
