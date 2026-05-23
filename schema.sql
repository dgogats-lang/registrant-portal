-- Registrant Portal — POC Schema
--
-- Column names mirror Quickbase field names (snake_cased) where a QB mapping exists.
-- users is portal-only — no QB equivalent.

-- ============================================================
-- users — the login gate (portal account holders)
-- No Quickbase equivalent; designed fresh for the portal.
-- ============================================================
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  first_name   TEXT,
  last_name    TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'active')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- events — mirrors QB "Hiring Events" table
--   event_name       ← QB: Event Name
--   event_start_date ← QB: Event Start Date
--   event_end_date   ← QB: Event End Date
-- ============================================================
CREATE TABLE events (
  id                SERIAL PRIMARY KEY,
  event_name        TEXT NOT NULL,
  event_start_date  DATE NOT NULL,
  event_end_date    DATE
);

-- ============================================================
-- registrations — mirrors QB "Registrations" table
--   event_id     ← QB: Related Hiring Event (relationship key)
--   date_created ← QB: Date Created
-- A user who appears here is a "registrant" for that event.
-- ============================================================
CREATE TABLE registrations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date_created  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- ============================================================
-- magic_tokens — one-time, expiring, revocable magic links
-- Portal-only; no QB equivalent.
-- ============================================================
CREATE TABLE magic_tokens (
  token        TEXT PRIMARY KEY,
  email        TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  used_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_magic_tokens_email ON magic_tokens(email);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- ============================================================
-- Seed: tester users (optional)
-- Uncomment and edit, or let testers self-sign-up with invite code.
-- ============================================================
-- INSERT INTO users (email, first_name, last_name, status) VALUES
--   ('tester1@example.com', 'Test', 'One', 'active'),
--   ('tester2@example.com', 'Test', 'Two', 'active');
