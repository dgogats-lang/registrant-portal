import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { verifyToken } from '../../lib/auth';
import { getUserByEmail, getAllEventsWithStatus } from '../../lib/dataService';

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
          <h1 className="text-2xl font-semibold text-neutral-900">Events</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Browse and register for upcoming events.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-6 py-14 text-center">
            <p className="text-neutral-500 text-sm">No events are available right now.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map(event => (
              <li
                key={event.id}
                className="bg-white rounded-xl border border-neutral-200 px-6 py-5"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">{event.event_name}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {formatDate(event.event_start_date)}
                      {event.event_end_date && event.event_end_date !== event.event_start_date ? ` – ${formatDate(event.event_end_date)}` : ''}
                    </p>
                    {errors[event.id] && (
                      <p className="text-xs text-red-600 mt-1.5">{errors[event.id]}</p>
                    )}
                  </div>
                  {event.is_registered ? (
                    <span className="shrink-0 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-500">
                      Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={!!registering[event.id]}
                      className="shrink-0 rounded-lg bg-[#0C2340] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a1c30] focus:outline-none focus:ring-2 focus:ring-[#0C2340] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {registering[event.id] ? 'Registering…' : 'Register'}
                    </button>
                  )}
                </div>
                {event.event_style && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-neutral-400 shrink-0">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8.25 8.25 0 00-16.5 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-neutral-400">{event.event_style}</span>
                  </div>
                )}
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

    const events = await getAllEventsWithStatus(user.id);
    return {
      props: JSON.parse(JSON.stringify({ events, user })),
    };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
}
