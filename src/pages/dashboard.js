import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { verifyToken } from '../../lib/auth';
import { getUserByEmail, getEventsByUser } from '../../lib/dataService';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function Dashboard({ user, registrations }) {
  const greeting = user.first_name ? `Welcome back, ${user.first_name}` : 'Welcome back';

  return (
    <>
      <Head><title>Dashboard — Registrant Portal</title></Head>
      <Layout>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">{greeting}</h1>
          <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-700">Your registrations</h2>
            {registrations.length > 0 && (
              <Link
                href="/events"
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Browse more events →
              </Link>
            )}
          </div>

          {registrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 px-6 py-14 text-center">
              <p className="text-neutral-500 text-sm mb-4">
                You haven't registered for any events yet.
              </p>
              <Link
                href="/events"
                className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Browse events
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {registrations.map(reg => (
                <li key={reg.id} className="bg-white rounded-xl border border-neutral-200 px-6 py-5">
                  <p className="font-medium text-neutral-900">{reg.event_name}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {formatDate(reg.event_start_date)}
                    {reg.event_end_date ? ` – ${formatDate(reg.event_end_date)}` : ''}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    Registered on {formatDate(reg.registered_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Layout>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const { session } = req.cookies;
  if (!session) return { redirect: { destination: '/login', permanent: false } };

  try {
    const payload = verifyToken(session);
    if (payload.type !== 'session') throw new Error('wrong token type');

    const user = await getUserByEmail(payload.email);
    if (!user || user.status !== 'active') {
      return { redirect: { destination: '/login', permanent: false } };
    }

    const registrations = await getEventsByUser(user.id);
    return {
      props: JSON.parse(JSON.stringify({ user, registrations })),
    };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
}
