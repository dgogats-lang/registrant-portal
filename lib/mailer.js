import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email, token) {
  const base = process.env.MAGIC_LINK_BASE_URL;
  const from = process.env.RESEND_FROM;
  if (!base) throw new Error('MAGIC_LINK_BASE_URL is not set');
  if (!from) throw new Error('RESEND_FROM is not set');

  const url = `${base}/verify?token=${token}`;

  await resend.emails.send({
    from,
    to: email,
    subject: 'Your Registrant Portal login link',
    html: `
      <p>Click the link below to log in. It expires in 15 minutes and can only be used once.</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}
