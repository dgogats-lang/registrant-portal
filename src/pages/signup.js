import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Signup() {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', inviteCode: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          inviteCode: form.inviteCode,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
        }),
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
      <Head><title>Create account — Registrant Portal</title></Head>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">Create account</h1>
            <p className="text-sm text-neutral-500 mb-6">
              You'll need an invite code to sign up.
            </p>

            {submitted ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4">
                <p className="text-sm font-medium text-emerald-800">Account created</p>
                <p className="text-sm text-emerald-700 mt-1">
                  We sent a login link to <strong>{form.email}</strong>. Click it to activate your
                  account. It expires in 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      autoFocus
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D92D27] focus:border-[#D92D27]"
                    />
                  </div>
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
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D92D27] focus:border-[#D92D27]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D92D27] focus:border-[#D92D27]"
                  />
                </div>
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Invite code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    autoComplete="off"
                    value={form.inviteCode}
                    onChange={handleChange}
                    placeholder="Enter your invite code"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D92D27] focus:border-[#D92D27]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !form.email || !form.inviteCode}
                  className="w-full rounded-lg bg-[#D92D27] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b82420] focus:outline-none focus:ring-2 focus:ring-[#D92D27] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-[#D92D27] font-medium hover:text-[#D92D27]/70">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
