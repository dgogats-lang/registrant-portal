import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Verify() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    const { token } = router.query;
    if (!token) {
      setStatus('error');
      setErrorMessage('No token found in this link. Try requesting a new one.');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setStatus('success');
          router.replace('/dashboard');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Something went wrong. Please try again.');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('Unable to reach the server. Please try again.');
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [router.isReady]);

  return (
    <>
      <Head><title>Logging you in — Registrant Portal</title></Head>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-[#0C2340] border-t-transparent animate-spin mx-auto mb-5" />
                <h1 className="text-lg font-semibold text-neutral-900">Logging you in…</h1>
                <p className="text-sm text-neutral-500 mt-1">Just a moment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-neutral-900">You're in!</h1>
                <p className="text-sm text-neutral-500 mt-1">Redirecting to your dashboard…</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-neutral-900 mb-2">Link issue</h1>
                <p className="text-sm text-neutral-600 mb-6">{errorMessage}</p>
                <Link
                  href="/login"
                  className="inline-block rounded-lg bg-[#0C2340] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a1c30] transition-colors"
                >
                  Request a new link
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
