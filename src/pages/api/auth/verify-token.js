import { getMagicToken, claimMagicToken, getUserByEmail, activateUser } from '../../../../lib/dataService';
import { signToken } from '../../../../lib/auth';

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  try {
    const token = req.method === 'GET' ? req.query.token : req.body?.token;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Fetch the record first so we can return specific error messages.
    const record = await getMagicToken(token);
    if (!record) {
      return res.status(400).json({ error: 'Invalid link' });
    }
    if (record.used_at) {
      return res.status(400).json({ error: 'This link has already been used. Request a new one.' });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This link has expired. Request a new one.' });
    }

    // Atomically mark as used — guards against a race if the link is clicked twice.
    const claimed = await claimMagicToken(token);
    if (!claimed) {
      return res.status(400).json({ error: 'This link has already been used. Request a new one.' });
    }

    let user = await getUserByEmail(record.email);
    if (!user) {
      return res.status(400).json({ error: 'Account not found' });
    }

    if (user.status === 'pending') {
      user = await activateUser(record.email);
    }

    const sessionToken = signToken(
      { type: 'session', sub: user.id, email: user.email },
      `${SESSION_MAX_AGE}s`,
    );

    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`,
    );

    return res.status(200).json({ token: sessionToken });
  } catch (err) {
    console.error('[verify-token]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
