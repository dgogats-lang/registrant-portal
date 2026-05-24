import sql from './db.js';

const isNeon = process.env.DATA_SOURCE === 'neon';

function notImplemented(fn) {
  throw new Error(`${fn}: Quickbase data source not yet implemented`);
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email) {
  if (isNeon) {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
    return rows[0] ?? null;
  }
  notImplemented('getUserByEmail');
}

export async function createUser(email, firstName, lastName) {
  if (isNeon) {
    const rows = await sql`
      INSERT INTO users (email, first_name, last_name, status)
      VALUES (${email}, ${firstName ?? null}, ${lastName ?? null}, 'pending')
      RETURNING *
    `;
    return rows[0];
  }
  notImplemented('createUser');
}

export async function activateUser(email) {
  if (isNeon) {
    const rows = await sql`
      UPDATE users SET status = 'active'
      WHERE email = ${email}
      RETURNING *
    `;
    return rows[0] ?? null;
  }
  notImplemented('activateUser');
}

export async function updateUser(userId, { firstName, lastName }) {
  if (isNeon) {
    const rows = await sql`
      UPDATE users
      SET first_name = ${firstName ?? null},
          last_name  = ${lastName ?? null}
      WHERE id = ${userId}
      RETURNING *
    `;
    return rows[0] ?? null;
  }
  notImplemented('updateUser');
}

// ── Events ───────────────────────────────────────────────────────────────────

export async function getEventsByUser(userId) {
  if (isNeon) {
    return sql`
      SELECT e.*, r.date_created AS registered_at, r.registration_status, r.organization
      FROM events e
      JOIN registrations r ON e.id = r.event_id
      WHERE r.user_id = ${userId}
      ORDER BY e.event_start_date ASC
    `;
  }
  notImplemented('getEventsByUser');
}

export async function getAvailableEvents(userId) {
  if (isNeon) {
    return sql`
      SELECT * FROM events
      WHERE id NOT IN (
        SELECT event_id FROM registrations WHERE user_id = ${userId}
      )
      ORDER BY event_start_date ASC
    `;
  }
  notImplemented('getAvailableEvents');
}

// ── Registrations ─────────────────────────────────────────────────────────────

export async function createRegistration(userId, eventId) {
  if (isNeon) {
    const rows = await sql`
      INSERT INTO registrations (user_id, event_id, registration_status)
      VALUES (${userId}, ${eventId}, 'Pending Approval')
      RETURNING *
    `;
    return rows[0];
  }
  notImplemented('createRegistration');
}

// ── Magic tokens ─────────────────────────────────────────────────────────────

export async function createMagicToken(email, token, expiresAt) {
  if (isNeon) {
    await sql`
      INSERT INTO magic_tokens (token, email, expires_at)
      VALUES (${token}, ${email}, ${expiresAt})
    `;
    return;
  }
  notImplemented('createMagicToken');
}

export async function getMagicToken(token) {
  if (isNeon) {
    const rows = await sql`SELECT * FROM magic_tokens WHERE token = ${token}`;
    return rows[0] ?? null;
  }
  notImplemented('getMagicToken');
}

// Atomically claims the token: sets used_at only if not already used and not expired.
// Returns the row on success, null if the token was already used or expired.
export async function claimMagicToken(token) {
  if (isNeon) {
    const rows = await sql`
      UPDATE magic_tokens
      SET used_at = NOW()
      WHERE token = ${token}
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING *
    `;
    return rows[0] ?? null;
  }
  notImplemented('claimMagicToken');
}
