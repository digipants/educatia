import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminAuthButton } from '../AdminAuthButton';
import { getAdminApplication } from '@/lib/adminApplicationInbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Application details',
  robots: { index: false, follow: false, noarchive: true }
};

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    .format(new Date(value));
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminApplication(id);
  if (result.status !== 'ok') {
    return (
      <main className="container page-shell py-16">
        <section className="card mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold">Application details</h1>
          <p className="mt-3 text-slate-600">
            {result.status === 'unavailable' ? 'The application inbox is currently unavailable.'
              : result.status === 'error' ? 'Application details could not be loaded. Please try again later.'
                : result.status === 'unauthenticated' ? 'Sign in with an authorized Google account to continue.'
                  : 'This Google account is not authorized to view applications.'}
          </p>
          {result.status === 'unauthenticated' ? <div className="mt-6"><AdminAuthButton action="sign-in" /></div> : null}
          {result.status === 'unauthorized' ? <div className="mt-6"><AdminAuthButton action="sign-out" /></div> : null}
        </section>
      </main>
    );
  }

  if (result.value.kind === 'invalid-id' || !result.value.application) {
    return (
      <main className="container page-shell py-16">
        <section className="card mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold">Application not found</h1>
          <Link className="btn mt-6" href="/admin/applications">Back to inbox</Link>
        </section>
      </main>
    );
  }

  const application = result.value.application;
  return (
    <main className="container page-shell py-10 sm:py-16">
      <section className="card mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin/applications" className="text-sm font-medium text-brand-primary">← Back to inbox</Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">{application.formType} application</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{application.name}</h1>
          </div>
          <AdminAuthButton action="sign-out" />
        </div>
        <dl className="mt-8 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Submitted</dt><dd className="mt-1 text-sm font-medium">{formatDate(application.submittedAt)}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Source</dt><dd className="mt-1 text-sm font-medium">{application.source}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-1 text-sm font-medium">{application.status}</dd></div>
        </dl>
        <dl className="mt-5 divide-y divide-slate-100">
          {application.fields.map(({ label, value }) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[minmax(12rem,1fr)_2fr] sm:gap-5">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
