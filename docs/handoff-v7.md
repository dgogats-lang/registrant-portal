# Registrant Portal — Handoff v7

> **Session summary:** Profile page, avatar dropdown menu, list/calendar toggle on dashboard, HOH brand colors applied throughout. Organization moved to the registrations table (per-registration, not per-user).

---

## Current State

The app is fully working on the dev preview.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## ⚠️ Migration Required

Run this in the Neon SQL editor before deploying:

```sql
ALTER TABLE registrations ADD COLUMN organization TEXT;
```

> If you previously ran `ALTER TABLE users ADD COLUMN organization TEXT;`, that column is unused and harmless — leave it or drop it with `ALTER TABLE users DROP COLUMN organization;`.

---

## What Was Done This Session

### Profile page
- `src/pages/profile.js` — email (read-only), editable first name and last name. Saves via PATCH.
- `src/pages/api/user/profile.js` — GET + PATCH, session-protected.
- `lib/dataService.js` — `updateUser(userId, { firstName, lastName })` added.

### Avatar dropdown menu
- `src/components/Layout.js` rebuilt. Profile and Sign out moved into a dropdown triggered by a user-initials avatar button top-right. Dropdown header shows user name + email. Click-outside closes it.
- Profile nav link removed from the main nav (now in dropdown only).

### Organization — per-registration, not per-user
Organization data comes from Quickbase and is tied to each registration — a user can represent different orgs across events. Rather than a user-level profile field, org lives on the `registrations` table and is shown per-event on the dashboard. A canonical "preferred org" can be derived from QB registration data when the Quickbase integration is built.

### List/calendar toggle on dashboard
- Toggle button (list icon / calendar icon) sits right of the "Your registrations" heading.
- **List view** — unchanged from before.
- **Calendar view** — monthly grid, events as colored pills matching status badge colors. Today's date highlighted. Multi-day events show a `→` suffix. Prev/next month navigation. Legend shows only statuses present in the user's registrations. Default month is the earliest upcoming event.
- Month name enlarged (`text-lg font-bold`); nav buttons given visible borders.

### HOH brand colors
Indigo replaced throughout with Hiring Our Heroes brand colors:

| Element | Color |
|---------|-------|
| Brand name, active nav, buttons, links, focus rings, avatar | HOH Blue `#0C2340` |
| 3px header top stripe, today marker on calendar, sign out | HOH Red `#D92D27` |

Status badge colors (amber, green, red, neutral) are unchanged — they serve a data-meaning purpose, not a brand purpose.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `schema.sql` | `organization TEXT` added to registrations table |
| `lib/dataService.js` | `updateUser` added; `getEventsByUser` selects `r.organization` |
| `src/pages/api/user/profile.js` | New — GET + PATCH profile API |
| `src/pages/profile.js` | New — profile page (first name, last name) |
| `src/components/Layout.js` | Avatar dropdown, HOH colors, red top stripe |
| `src/pages/dashboard.js` | List/calendar toggle, calendar view, HOH colors |
| `src/pages/events.js` | Passes `user` to Layout; HOH colors |
| `src/pages/login.js` | HOH colors |
| `src/pages/signup.js` | HOH colors |
| `src/pages/verify.js` | HOH colors |

---

## Environment Variables

No new env vars. Same as v6.

---

## Known Issues (carried from v6)

### Pending user stuck state

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
