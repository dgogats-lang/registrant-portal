import { getUserByEmail, createUser, createMagicToken } from '../../../../lib/dataService';
import { generateMagicToken } from '../../../../lib/auth';
import { sendMagicLink } from '../../../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, inviteCode, firstName, lastName } = req.body ?? {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }
    if (inviteCode !== process.env.SIGNUP_INVITE_CODE) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await getUserByEmail(normalized);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    await createUser(
      normalized,
      typeof firstName === 'string' ? firstName.trim() : null,
      typeof lastName === 'string' ? lastName.trim() : null,
    );

    const token = generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await createMagicToken(normalized, token, expiresAt);
    await sendMagicLink(normalized, token);

    return res.status(201).json({
      message: 'Account created. Check your email for a login link.',
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
