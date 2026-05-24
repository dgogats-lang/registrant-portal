import { useState, useEffect, useRef } from 'react';
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
          ? 'text-[#0C2340] bg-[#0C2340]/10'
          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
      }`}
    >
      {children}
    </Link>
  );
}

function getInitials(user) {
  if (!user) return '?';
  const first = user.first_name?.trim();
  const last = user.last_name?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return '?';
}

function getDisplayName(user) {
  if (!user) return '';
  const first = user.first_name?.trim();
  const last = user.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  return user.email ?? '';
}

export default function Layout({ children, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="h-[3px] bg-[#D92D27]" />
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-[#0C2340] tracking-tight">
            Registrant Portal
          </span>
          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/events">Events</NavLink>
            </nav>

            {/* Avatar menu */}
            <div className="relative ml-3" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="User menu"
                aria-expanded={menuOpen}
                className="w-9 h-9 rounded-full bg-[#0C2340]/10 border border-[#0C2340]/25 flex items-center justify-center text-sm font-medium text-[#0C2340] hover:bg-[#0C2340]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0C2340] focus:ring-offset-2"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  {/* User info header */}
                  {user && (
                    <div className="px-4 py-3 border-b border-neutral-100">
                      {displayName && (
                        <p className="text-sm font-medium text-neutral-900 truncate">{displayName}</p>
                      )}
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                  )}

                  {/* Profile link */}
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Profile
                  </Link>

                  <div className="border-t border-neutral-100" />

                  {/* Sign out */}
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#D92D27] hover:bg-[#D92D27]/5 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
