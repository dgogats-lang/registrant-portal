import { getUserByEmail, createMagicToken } from '../../../../lib/dataService';
import { generateMagicToken } from '../../../../lib/auth';
import { sendMagicLink } from '../../../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email } = req.body ?? {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalized = email.toLowerCase().trim();
    const user = await getUserByEmail(normalized);

    // Only send a link if the user exists and is active.
    // Always return the same message to avoid revealing whether an email is registered.
    if (user?.status === 'active') {
      const token = generateMagicToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await createMagicToken(normalized, token, expiresAt);
      await sendMagicLink(normalized, token);
    }

    return res.status(200).json({
      message: 'If your email is registered, you will receive a login link shortly.',
    });
  } catch (err) {
    console.error('[request-link]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
