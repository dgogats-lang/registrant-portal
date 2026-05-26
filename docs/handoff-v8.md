# Registrant Portal — Handoff v8

> **Session summary:** Dashboard and Events page polish — UI cleanup, mobile layout fix, event style labels, upcoming events stat card.

---

## Current State

The app is fully working on the dev preview.

**Preview (dev branch):** `https://registrant-portal-git-dev-david-g-projects1.vercel.app`  
**Production (main branch):** `https://registrant-portal.vercel.app` — still has old scaffold, do not use until dev is merged

---

## ⚠️ Migration Required

No new migrations this session. If you haven't run the v7 migration yet, run it first:

```sql
ALTER TABLE registrations ADD COLUMN organization TEXT;
```

---

## What Was Done This Session

### Dashboard cleanup
- Removed the "Browse more events →" link from the dashboard header area.
- Removed the user's email address from the dashboard greeting (accessible via profile instead).

### Events page — show all events
Previously the events page only showed events the user hadn't registered for. Now it shows all events. Events the user is already registered for display a grey "Registered" badge in place of the Register button. Page heading updated from "Available events" to "Events".

`lib/dataService.js` — added `getAllEventsWithStatus(userId)`: LEFT JOIN query that returns all events with an `is_registered` boolean.

### Registration card mobile layout fix
On mobile, the date was being squeezed into two lines by the status badge sharing the same flex row. Restructured the card so the status badge sits beside the event name on the top row, and the date gets its own full-width line below.

### Date range display
Both the dashboard and events page now only show the end date when it differs from the start date. Single-day events no longer render a redundant "Date – Date" range.

### Event style label
Both dashboard registration cards and events page cards now show a footer row at the bottom with a map pin icon and the `event_style` value. The footer is separated by a thin top border and only renders if `event_style` has a value. Label is `text-xs text-neutral-400`.

> **Note:** This requires an `event_style` column on the `events` table. If it doesn't exist yet, add it:
> ```sql
> ALTER TABLE events ADD COLUMN event_style TEXT;
> ```

### Upcoming events stat card
A stat card now appears on the dashboard between the greeting and the "Your registrations" section, but only when the user has at least one registration. Shows the count of registrations where `event_start_date` is today or later. Styled `bg-neutral-100 rounded-lg p-4` with centered text.

---

## Files Changed This Session

| File | Change |
|------|--------|
| `src/pages/dashboard.js` | Removed email + "Browse more events"; mobile card layout fix; date range fix; event style footer; upcoming events stat card |
| `src/pages/events.js` | Show all events with registered state; date range fix; event style footer |
| `lib/dataService.js` | `getAllEventsWithStatus(userId)` added |

---

## Environment Variables

No new env vars. Same as v7.

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
- [ ] **Run the `organization` column migration in Neon** (see v7)
- [ ] **Add `event_style` column to `events` table** (see above)
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
3. To continue in Cowork: open a new chat and say *"Read docs/handoff-v8.md — that's the current state. Here's what I want to do next: [your task]"*
4. To continue in Claude Code: run `claude` from the project folder and reference `docs/handoff-v8.md`
