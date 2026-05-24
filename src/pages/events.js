import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { verifyToken } from '../../lib/auth';
import { getUserByEmail, getAvailableEvents } from '../../lib/dataService';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function Events({ events, user }) {
  const router = useRouter();
  const [registering, setRegistering] = useState({});
  const [errors, setErrors] = useState({});

  async function handleRegister(eventId) {
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    setErrors(prev => ({ ...prev, [eventId]: null }));

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setErrors(prev => ({ ...prev, [eventId]: data.error || 'Registration failed.' }));
        setRegistering(prev => ({ ...prev, [eventId]: false }));
      }
    } catch {
      setErrors(prev => ({ ...prev, [eventId]: 'Unable to reach the server. Try again.' }));
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  }

  return (
    <>
      <Head><title>Events — Registrant Portal</title></Head>
      <Layout user={user}>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Available events</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Events you haven't registered for yet.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-6 py-14 text-center">
            <p className="text-neutral-500 text-sm">
              You're registered for all available events.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map(event => (
              <li
                key={event.id}
                className="bg-white rounded-xl border border-neutral-200 px-6 py-5 flex items-center justify-between gap-6"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{event.event_name}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {formatDate(event.event_start_date)}
                    {event.event_end_date ? ` – ${formatDate(event.event_end_date)}` : ''}
                  </p>
                  {errors[event.id] && (
                    <p className="text-xs text-red-600 mt-1.5">{errors[event.id]}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRegister(event.id)}
                  disabled={!!registering[event.id]}
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registering[event.id] ? 'Registering…' : 'Register'}
                </button>
              </li>
            ))}
          </ul>
        )}
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

    const events = await getAvailableEvents(user.id);
    return {
      props: JSON.parse(JSON.stringify({ events, user })),
    };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
}
