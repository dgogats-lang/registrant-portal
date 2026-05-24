import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { verifyToken } from '../../lib/auth';
import { getUserByEmail } from '../../lib/dataService';

export default function Profile({ user: initialUser }) {
  const [form, setForm] = useState({
    firstName: initialUser.first_name ?? '',
    lastName: initialUser.last_name ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setSuccess(false);
    setError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head><title>Profile — Registrant Portal</title></Head>
      <Layout>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Your profile</h1>
          <p className="text-sm text-neutral-500 mt-1">Update your name below.</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email — read-only */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email address
              </label>
              <p className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500 select-all">
                {initialUser.email}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Your email can't be changed — it's your login identity.
              </p>
            </div>

            {/* First name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Jane"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Last name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Smith"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Feedback */}
            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                Profile updated.
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
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

    return {
      props: JSON.parse(JSON.stringify({ user })),
    };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
}
