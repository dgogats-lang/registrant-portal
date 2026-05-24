export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader(
    'Set-Cookie',
    'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
  res.redirect(302, '/login');
}
