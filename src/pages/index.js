import { verifyToken } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  const { session } = req.cookies;
  if (session) {
    try {
      const payload = verifyToken(session);
      if (payload.type === 'session') {
        return { redirect: { destination: '/dashboard', permanent: false } };
      }
    } catch {
      // invalid token — fall through to login
    }
  }
  return { redirect: { destination: '/login', permanent: false } };
}

export default function Home() {
  return null;
}
