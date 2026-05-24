import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Sign in — Registrant Portal</title></Head>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">Sign in</h1>
            <p className="text-sm text-neutral-500 mb-6">
              We'll send a one-time login link to your inbox.
            </p>

            {submitted ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4">
                <p className="text-sm font-medium text-emerald-800">Check your inbox</p>
                <p className="text-sm text-emerald-700 mt-1">
                  We sent a login link to <strong>{email}</strong>. It expires in 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending…' : 'Send login link'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-4">
            New here?{' '}
            <Link href="/signup" className="text-indigo-600 font-medium hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
