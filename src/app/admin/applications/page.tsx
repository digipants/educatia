import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminAuthButton } from './AdminAuthButton';
import { listAdminApplications } from '@/lib/adminApplicationInbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Applications inbox',
  robots: { index: false, follow: false, noarchive: true }
};

type SearchParams = { page?: string | string[]; limit?: string | string[] };

function AccessState({ status }: { status: string }) {
  const copy = status === 'unavailable'
    ? 'The application inbox is currently unavailable.'
    : status === 'error'
      ? 'Applications could not be loaded. Please try again later.'
      : status === 'unauthenticated'
        ? 'Sign in with an authorized Google account to continue.'
        : 'This Google account is not authorized to view applications.';

  return (
    <section className="card mx-auto max-w-xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Educatia administration</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">Applications inbox</h1>
      <p className="mt-3 text-slate-600">{copy}</p>
      {status === 'unauthenticated' ? <div className="mt-6"><AdminAuthButton action="sign-in" /></div> : null}
      {status === 'unauthorized' ? <div className="mt-6"><AdminAuthButton action="sign-out" /></div> : null}
    </section>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    .format(new Date(value));
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const result = await listAdminApplications(await searchParams);
  if (result.status !== 'ok') return <div className="container page-shell py-16"><AccessState status={result.status} /></div>;
  if (result.value.kind === 'invalid-pagination') {
    return <div className="container page-shell py-16"><AccessState status="error" /></div>;
  }

  const { items, total, page, pageCount, limit } = result.value;
  return (
    <div className="container page-shell py-10 sm:py-16">
      <section className="card mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Educatia administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Applications inbox</h1>
          <p className="mt-2 text-sm text-slate-600">{total} application{total === 1 ? '' : 's'}</p>
        </div>
        <AdminAuthButton action="sign-out" />
      </section>

      <section className="space-y-3" aria-label="Recent applications">
        {items.length ? items.map((application) => (
          <Link
            key={application.id}
            href={`/admin/applications/${encodeURIComponent(application.id)}`}
            className="card block p-4 sm:p-5"
          >
            <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-brand-primary">{application.formType}</span>
                <span className="mt-1 block font-semibold text-slate-900">{application.name}</span>
              </span>
              <span className="text-sm text-slate-600">{formatDate(application.submittedAt)}</span>
            </span>
            <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>Source: {application.source}</span>
              <span>Status: {application.status}</span>
              <span>Assigned to: {application.assignedTo ?? 'Unassigned'}</span>
            </span>
          </Link>
        )) : (
          <div className="card text-center text-slate-600">No applications to display.</div>
        )}
      </section>

      <nav className="mt-6 flex items-center justify-between" aria-label="Application pages">
        {page > 1 ? <Link className="btn" href={`/admin/applications?page=${page - 1}&limit=${limit}`}>Previous</Link> : <span />}
        <span className="text-sm text-slate-600">Page {page} of {pageCount}</span>
        {page < pageCount ? <Link className="btn" href={`/admin/applications?page=${page + 1}&limit=${limit}`}>Next</Link> : <span />}
      </nav>
    </div>
  );
}
