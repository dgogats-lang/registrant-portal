import { useState } from 'react';
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

const statusStyles = {
  'Accepted':         'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200',
  'Denied':           'bg-red-50 text-red-700 border-red-200',
  'Cancelled':        'bg-neutral-100 text-neutral-500 border-neutral-200',
  'Duplicate':        'bg-neutral-100 text-neutral-500 border-neutral-200',
};

const calendarColors = {
  'Accepted':         { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  'Pending Approval': { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  'Denied':           { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  'Cancelled':        { bg: '#f5f5f4', text: '#78716c', border: '#e7e5e4' },
  'Duplicate':        { bg: '#f5f5f4', text: '#78716c', border: '#e7e5e4' },
};
const fallbackColor = { bg: '#f5f5f4', text: '#78716c', border: '#e7e5e4' };

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarView({ registrations }) {
  const today = new Date();

  // Default to the month of the earliest upcoming event, else current month
  const firstUpcoming = registrations
    .map(r => ({ reg: r, date: new Date(r.event_start_date + 'T00:00:00Z') }))
    .filter(({ date }) => date >= new Date(today.getFullYear(), today.getMonth(), 1))
    .sort((a, b) => a.date - b.date)[0];

  const defaultDate = firstUpcoming ? firstUpcoming.date : today;
  const [year, setYear] = useState(defaultDate.getUTCFullYear());
  const [month, setMonth] = useState(defaultDate.getUTCMonth());

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Build grid cells: null = padding, number = day of month
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Index registrations by day-of-month for the current view
  const byDay = {};
  for (const reg of registrations) {
    const d = reg.event_start_date?.slice(0, 10);
    if (!d) continue;
    const [ry, rm, rd] = d.split('-').map(Number);
    if (ry === year && rm - 1 === month) {
      if (!byDay[rd]) byDay[rd] = [];
      byDay[rd].push(reg);
    }
  }

  const todayDay =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : null;

  // Only show legend for statuses present in the full registration list
  const presentStatuses = [...new Set(
    registrations.map(r => r.registration_status).filter(Boolean)
  )];
  // Preserve a consistent order
  const statusOrder = ['Accepted','Pending Approval','Denied','Cancelled','Duplicate'];
  const legendStatuses = statusOrder.filter(s => presentStatuses.includes(s));

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-px">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-neutral-400 pb-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-t border-l border-neutral-200 rounded-xl overflow-hidden">
        {cells.map((day, i) => {
          const events = day ? (byDay[day] ?? []) : [];
          const isToday = day === todayDay;
          const isEmpty = !day;
          return (
            <div
              key={i}
              className={`border-r border-b border-neutral-200 min-h-[88px] p-1.5 ${isEmpty ? 'bg-neutral-50' : 'bg-white'}`}
            >
              {day && (
                <>
                  <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {events.map(reg => {
                      const color = calendarColors[reg.registration_status] ?? fallbackColor;
                      const isMultiDay = reg.event_end_date && reg.event_end_date !== reg.event_start_date;
                      return (
                        <div
                          key={reg.id}
                          title={`${reg.event_name}${reg.organization ? ` · ${reg.organization}` : ''} — ${reg.registration_status}`}
                          style={{
                            background: color.bg,
                            color: color.text,
                            borderColor: color.border,
                          }}
                          className="text-xs px-1.5 py-0.5 rounded border leading-snug truncate"
                        >
                          {reg.event_name}{isMultiDay ? ' →' : ''}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {legendStatuses.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {legendStatuses.map(status => {
            const color = calendarColors[status] ?? fallbackColor;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  style={{ background: color.bg, borderColor: color.border }}
                  className="w-3 h-3 rounded-sm border flex-shrink-0"
                />
                <span className="text-xs text-neutral-500">{status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ListIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

export default function Dashboard({ user, registrations }) {
  const [view, setView] = useState('list');
  const greeting = user.first_name ? `Welcome back, ${user.first_name}` : 'Welcome back';

  return (
    <>
      <Head><title>Dashboard — Registrant Portal</title></Head>
      <Layout user={user}>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">{greeting}</h1>
          <p className="text-sm text-neutral-500 mt-1">{user.email}</p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-700">Your registrations</h2>

            {registrations.length > 0 && (
              <div className="flex items-center gap-3">
                {view === 'list' && (
                  <Link
                    href="/events"
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Browse more events →
                  </Link>
                )}

                {/* View toggle */}
                <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setView('list')}
                    aria-label="List view"
                    className={`p-2 transition-colors ${
                      view === 'list'
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'bg-white text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ListIcon />
                  </button>
                  <div className="w-px bg-neutral-200" />
                  <button
                    onClick={() => setView('calendar')}
                    aria-label="Calendar view"
                    className={`p-2 transition-colors ${
                      view === 'calendar'
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'bg-white text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <CalendarIcon />
                  </button>
                </div>
              </div>
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
          ) : view === 'list' ? (
            <ul className="space-y-3">
              {registrations.map(reg => (
                <li key={reg.id} className="bg-white rounded-xl border border-neutral-200 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">{reg.event_name}</p>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {formatDate(reg.event_start_date)}
                        {reg.event_end_date ? ` – ${formatDate(reg.event_end_date)}` : ''}
                      </p>
                      {reg.organization && (
                        <p className="text-sm text-neutral-500 mt-0.5">{reg.organization}</p>
                      )}
                      <p className="text-xs text-neutral-400 mt-2">
                        Registered on {formatDate(reg.registered_at)}
                      </p>
                    </div>
                    {reg.registration_status && (
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[reg.registration_status] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                        {reg.registration_status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <CalendarView registrations={registrations} />
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
