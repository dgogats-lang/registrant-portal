import { createRegistration } from '../../../lib/dataService';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { session } = req.cookies;
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    const payload = verifyToken(session);
    if (payload.type !== 'session') return res.status(401).json({ error: 'Not authenticated' });

    const { eventId } = req.body ?? {};
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const registration = await createRegistration(payload.sub, Number(eventId));
    return res.status(201).json({ registration });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already registered for this event' });
    }
    console.error('[registrations]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
