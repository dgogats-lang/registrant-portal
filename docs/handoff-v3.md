# Registrant Portal — Project Handoff Document (v3)

> **Note for the next chat:** This v3 supersedes v2. The substantive design is unchanged from v2 — what's different is **terminology and the project name**, applied consistently across schema, code, and prose. The biggest carry-over from v2 still stands: **the mock JSON data layer was replaced with a real Neon Postgres database for the POC**, and a **self-serve signup flow (gated by an invite code)** is in. Placeholder field/column names are used throughout and flagged with 🔶 — the real Quickbase field names will be provided separately and should be mapped in.

---

## Terminology

This project distinguishes three concepts that earlier drafts used loosely:

- **User** — anyone with a portal account. The login gate. Lives in the `users` table.
- **Registrant** — a User who has registered for at least one event. Not a separate table; it's a role/description applied to Users who appear in `registrations`. Use this term in user-facing copy and domain discussions.
- **Registration** — the record of one User signing up for one Event. Lives in the `registrations` table.

A User can exist with zero registrations (signed up to the portal but hasn't registered for anything yet). They're a User, not yet a Registrant. The moment they register for an event, they become a Registrant in addition to being a User.

---

## Project Summary

A web portal for registrants to view and manage their event registrations. Built as a proof of concept with a clean migration path to production on Azure.

The POC is **internet-accessible via Vercel** so a known group of testers can use it. Access is controlled by authentication (magic links) plus an invite-code-gated signup, **not** by keeping the URL secret.

---

## Getting Started from Scratch

If the project folder does not exist yet, start here. This section creates the complete project skeleton. No source code yet — that comes later via Claude Code.

### Cowork prompt — run this first

Open Cowork and paste the following. Cowork will create the full folder structure and all starter files from the content embedded below.

> *"I'm setting up a new project called Registrant Portal from scratch. Read this entire handoff document carefully — it is the source of truth. Then do the following:*
> *1. Create a folder called `registrant-portal` in my Projects folder (or wherever I keep projects — ask me if you're unsure).*
> *2. Inside it, create a `docs` subfolder and save this handoff document into it as `handoff-v3.md`.*
> *3. Create each of the four starter files listed in the 'Starter files' section of this document, using the exact content provided.*
> *4. Confirm when done and tell me what the next blocking item is before any code can be written."*

The correct answer to "what's the next blocking item" is **getting the real Quickbase field names** so the placeholder columns in `schema.sql` can be finalized.

---

### Folder structure to create

```
registrant-portal/
├── README.md
├── .env.example
├── .gitignore
├── schema.sql
└── docs/
    └── handoff-v3.md    ← this file
```

No source code folders yet. Those are created by `npx create-next-app` when Claude Code scaffolds the Next.js app.

---

### Starter files

Create each file below with the exact content shown.

---

#### `README.md`

See the README.md in the project root.

---

#### `.env.example`

See the .env.example in the project root.

---

#### `.gitignore`

See the .gitignore in the project root.

---

#### `schema.sql`

See the schema.sql in the project root.

---

### After Cowork finishes

These steps require you, not Cowork:

- [ ] Create a GitHub repo named `registrant-portal` and push the folder (`git init`, `git remote add origin …`, `git push`).
- [ ] Create a Neon project and copy the connection string into `.env.local` as `DATABASE_URL`.
- [ ] Create a Resend account and verify a sending domain before inviting testers.
- [ ] Connect the GitHub repo to Vercel (set `dev` as the preview branch, `main` as production).

Once those are done, bring in **Claude Code** to scaffold the Next.js app and build the auth routes, data layer, and frontend pages — see the Open Items section.

---

## Core Requirements

- Users log in to view their event registrations
- Users can register for new events (which makes them Registrants for those events)
- New users can sign up themselves, gated by a shared invite code
- No direct browser access to the database or to Quickbase (all data access is server-side)
- POC uses **Neon Postgres**; production flips to live Quickbase API via the same switch
- Authentication via magic links (email-based, no passwords)

---

## Agreed Stack

| Layer          | POC                           | Production (Azure)    |
|----------------|-------------------------------|-----------------------|
| Frontend       | React + Tailwind CSS (v4)     | Same                  |
| Backend        | Vercel API Routes (serverless)| Azure Functions       |
| Auth           | Magic links via Resend + JWT  | Same or Azure Entra ID|
| Data           | **Neon Postgres**             | Quickbase API         |
| Hosting        | Vercel (free tier)            | Azure Static Web Apps |
| Version Control| GitHub                        | Same                  |

---

## Architecture Pattern

All database and Quickbase calls are routed through serverless functions — **never exposed to the browser**. Secrets (DB connection string, Quickbase API key, JWT secret, invite code) live in server-side environment variables only.

The data-source switch from the original doc is preserved — it just swaps one value:

- `DATA_SOURCE=neon` → reads/writes Neon Postgres (POC)
- `DATA_SOURCE=quickbase` → calls Quickbase API (production)

Function **signatures and return values never change** between POC and production. Only the query logic behind the switch changes. This is the key portability property the original design got right, and it's preserved.

---

## Authentication Design

### Two distinct tokens — do not conflate them

| Token              | Lifespan | Job                               | Where it lives       | Storage            |
|--------------------|----------|-----------------------------------|----------------------|--------------------|
| Magic-link token   | ~15 min  | One-time proof of email ownership | In the emailed URL   | **Database-backed**|
| Session token (JWT)| ~7 days  | Ongoing "this person is logged in"| Browser, after verify| Stateless          |

**Rules:**

- The magic-link token must **never** become the session token. Different `exp`, and ideally a `type` claim (`"magic"` vs `"session"`) so a magic token cannot be replayed as a session.
- The magic-link token is **database-backed** specifically so it can be **expiring, revocable, and single-use** — properties a stateless token can't provide.
- The session token stays a **stateless JWT** so every API call doesn't require a DB lookup.

### Why the magic link is DB-backed

Once we added a database, the only reason for going stateless (no storage available) disappeared. Storing the link token gives us:

- **Expirable** — check `expires_at` on click
- **Revocable** — delete the row / set `used_at` to kill a link instantly
- **Single-use** — once `used_at` is set, a second click fails (protects forwarded/leaked links)

### Magic-link click behavior

The link lands on a small **"logging you in…" page that then redirects**, rather than dropping straight onto the Dashboard. This gives a place to show a friendly error if the link is expired/used/invalid.

---

## Signup Flow

New users can onboard themselves, **gated by a shared invite code**.

### Flow end to end

1. User opens signup form, enters **email + invite code**.
2. Server checks the code against `SIGNUP_INVITE_CODE` (env var — rotatable, never hardcoded, never stored in DB).
3. Wrong code → rejected.
4. Right code → server creates a user record in **`pending`** status and emails a magic link.
5. User clicks the link → user flips to **`active`** and is logged in.

### Why this is secure enough for the POC

- Signup and login **converge** on the same magic-link machinery — only one fork at the front (signup needs the code + creates a pending record; login looks up an existing active record).
- The magic link doubles as **email verification**: someone could submit `ceo@org.org` at signup, but they can't log in as them because the link goes to the real inbox. So impersonation at signup is neutralized at the login step.
- The invite code keeps the public URL from meaning "the whole internet can join."

### Known limitation (accepted for POC)

A **single shared invite code is a shared secret** — if a tester forwards it, the recipient can sign up. Acceptable for a friendly known test group. Upgrade path if ever needed: per-person single-use codes. Do **not** build this for the POC.

### Explicitly out of scope for POC

Password accounts, account recovery, rate limiting, CAPTCHA. Revisit only at production hardening.

---

## Access Model

- The app is **internet-accessible** once deployed to Vercel — `dev` branch gets a preview URL, `main` gets the production URL. Testers use the preview URL.
- Neon is a **hosted cloud database** — reachable only by the serverless functions holding the connection string, never by the browser.
- A Vercel **preview URL is public but unguessable** — it's obscure, not private. With fake/test data this is fine. If real user data is ever used in testing, turn on **Vercel deployment protection**.
- The security gate is **authentication + invite code**, not URL secrecy.

---

## Data Model / Schema

> 🔶 **All column names below are PLACEHOLDERS.** The real Quickbase field names will be provided separately. When mapping: rename these columns to mirror the Quickbase fields exactly, so the eventual Quickbase swap is painless. This schema doubles as the Quickbase field-mapping reference.

### `users` 🔶

| column         | type         | notes                                             |
|----------------|--------------|---------------------------------------------------|
| `id`           | PK           | user identifier                                   |
| `email` 🔶      | text, unique | login identity                                    |
| `first_name` 🔶 | text         |                                                   |
| `last_name` 🔶  | text         |                                                   |
| `status`       | enum         | `pending` / `active` — gates login until verified |
| `created_at`   | timestamp    | hygiene; tracks signup time during testing        |

### `events` 🔶

| column         | type | notes               |
|----------------|------|---------------------|
| `id`           | PK   |                     |
| `title` 🔶      | text |                     |
| `event_date` 🔶 | date |                     |
| `location` 🔶   | text |                     |
| `capacity` 🔶   | int  |                     |
| `registered` 🔶 | int  | or derive via count |

### `registrations` 🔶

A row here means the linked User is a Registrant for the linked Event.

| column           | type         | notes                                       |
|------------------|--------------|---------------------------------------------|
| `id`             | PK           |                                             |
| `user_id`        | FK → users   | a registration ALWAYS points back to a User |
| `event_id`       | FK → events  |                                             |
| `registered_at`  | timestamp    |                                             |

### `magic_tokens`

| column       | type      | notes                                       |
|--------------|-----------|---------------------------------------------|
| `token`      | text/PK   | random string (or JWT id) sent in the link  |
| `email`      | text      | who it's for                                |
| `expires_at` | timestamp | freshness check                             |
| `used_at`    | timestamp | null until clicked; set on use (single-use) |

### Key relationship clarification

**`users` and `registrations` are separate tables doing separate jobs:**

- `users` = who is allowed to log in (the guest list)
- `registrations` = which events a logged-in User signed up for (what they did inside)

A User can log in with **zero registrations** — that's normal (empty Dashboard, then register via Events page). They're a User but not yet a Registrant. **Being a User is the login gate; being a Registrant is a consequence of using the portal, not a prerequisite to entering it.**

---

## `dataService.js` Pattern

```javascript
// lib/dataService.js
const isNeon = process.env.DATA_SOURCE === 'neon';

export async function getUserByEmail(email) {
  if (isNeon) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  }
  // Quickbase API call goes here later
}

// getEventsByUser, getAvailableEvents, createRegistration follow the
// same shape: real SQL behind the isNeon branch, Quickbase stub below.
```

---

## Recommended Folder Structure (after Claude Code scaffolds Next.js)

```
registrant-portal/
├── README.md
├── package.json
├── .env.example
├── .env.local              ← gitignored; your real secrets
├── .gitignore
├── schema.sql
├── docs/
│   └── handoff-v3.md
├── api/
│   └── auth/
│       ├── request-link.js
│       ├── verify-token.js
│       └── signup.js
├── lib/
│   ├── dataService.js
│   ├── db.js
│   ├── auth.js
│   └── mailer.js
└── src/
    ├── pages/
    │   ├── login.jsx
    │   ├── signup.jsx
    │   ├── verify.jsx
    │   ├── dashboard.jsx
    │   └── events.jsx
    ├── components/
    └── styles/
```

---

## Setup / Testing Notes

### Neon

- Recommended because it powers Vercel's native Postgres integration (≈one-click connect, auto-populates env vars) and supports database branching that maps onto the `dev`/`main` Git branch workflow.
- Free tier (≈500MB, scale-to-zero) is far more than a POC needs.
- 🔶 Confirm current Neon free-tier terms at build time (they shift).

### Resend

- 🔶 **Check current Resend free-tier sending rules before testing.** On a fresh free account you typically can only send to verified addresses until a sending domain is verified. This can silently block testers from receiving magic links and look like a bug. Verify a sending domain before handing out the portal link.

### Seeding testers

- Testers must exist in the `users` table (or self-sign-up via invite code) to log in. For a controlled start, seed tester rows in `schema.sql`, or just give testers the invite code and let them self-onboard.

---

## Decision Log (cumulative)

1. **Mock JSON layer → Neon Postgres** for the POC. JSON files retired.
2. **`DATA_SOURCE` switch values:** `mock`/`quickbase` → `neon`/`quickbase`.
3. **Magic link is DB-backed** (`magic_tokens` table) → expiring, revocable, single-use.
4. **Two tokens formalized:** DB-backed magic link vs. stateless session JWT, separated by a `type` claim.
5. **Magic-link click → "logging you in…" interstitial** with redirect, to surface friendly errors.
6. **Self-serve signup added, gated by `SIGNUP_INVITE_CODE`**; account activates only after magic-link click.
7. **User `status` (`pending`/`active`) + `created_at`** added to support signup flow.
8. **Access model clarified:** internet-accessible for testers; security via auth + invite code, not URL secrecy.
9. **Confirmed:** being a User is the login gate; being a Registrant (having a registration) is not.
10. **Terminology unified and project renamed to Registrant Portal (v3).** Tables and code use `users` (formerly `participants`) for the login concept; **Registrant** is the domain/UI term for Users who have submitted at least one registration; **Registration** is the record of one User signing up for one Event. The portal does not track attendance — only registrations.

---

## Open Items for the Next Chat

- 🔶 **Provide real Quickbase field names** and map them onto the placeholder columns above (users, events, registrations).
- [ ] Finalize `schema.sql` with real field names.
- [ ] GitHub repo created, Vercel connected, Neon project created, Resend domain verified.
- [ ] Claude Code: scaffold Next.js app (`npx create-next-app`).
- [ ] Claude Code: build auth routes (`request-link.js`, `verify-token.js`, `signup.js`).
- [ ] Claude Code: implement `dataService.js` SQL behind the `isNeon` branch.
- [ ] Claude Code: frontend pages (Login, Signup, Verify, Dashboard, Events).

### Still parked for production

- Obtain Quickbase API key + realm details
- Implement Quickbase calls in `dataService.js`
- Set up Azure Static Web Apps + Azure Functions
- Decide long-term auth (magic links vs. Azure Entra ID)
- Set `DATA_SOURCE=quickbase` in production env vars
