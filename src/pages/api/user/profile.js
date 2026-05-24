import { verifyToken } from '../../../../lib/auth';
import { getUserByEmail, updateUser } from '../../../../lib/dataService';

export default async function handler(req, res) {
  const { session } = req.cookies;
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  let payload;
  try {
    payload = verifyToken(session);
    if (payload.type !== 'session') throw new Error('wrong token type');
  } catch {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const user = await getUserByEmail(payload.email);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      email: user.email,
      firstName: user.first_name ?? '',
      lastName: user.last_name ?? '',
    });
  }

  if (req.method === 'PATCH') {
    const { firstName, lastName } = req.body ?? {};

    if (typeof firstName !== 'undefined' && typeof firstName !== 'string') {
      return res.status(400).json({ error: 'firstName must be a string' });
    }
    if (typeof lastName !== 'undefined' && typeof lastName !== 'string') {
      return res.status(400).json({ error: 'lastName must be a string' });
    }

    const updated = await updateUser(user.id, {
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
    });

    return res.status(200).json({
      email: updated.email,
      firstName: updated.first_name ?? '',
      lastName: updated.last_name ?? '',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
