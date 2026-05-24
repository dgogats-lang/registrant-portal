import Link from 'next/link';
import { useRouter } from 'next/router';

function NavLink({ href, children }) {
  const { pathname } = useRouter();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-neutral-900 tracking-tight">
            Registrant Portal
          </span>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/events">Events</NavLink>
            <form action="/api/auth/signout" method="POST" className="ml-3">
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
