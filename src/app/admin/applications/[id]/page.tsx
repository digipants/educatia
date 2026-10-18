import Link from 'next/link';
import type { Metadata } from 'next';
import { randomUUID } from 'node:crypto';
import { AdminAuthButton } from '../AdminAuthButton';
import { updateAdminApplicationStatus } from './actions';
import { updateAdminApplicationAssignment } from './assignmentActions';
import { APPLICATION_STATUSES, isApplicationStatus } from '@/lib/applicationStatus';
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

export default async function ApplicationDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ update?: string | string[]; assignment?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getAdminApplication(id);
  if (result.status !== 'ok') {
    return (
      <div className="container page-shell py-16">
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
      </div>
    );
  }

  if (result.value.kind === 'invalid-id' || !result.value.application) {
    return (
      <div className="container page-shell py-16">
        <section className="card mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold">Application not found</h1>
          <Link className="btn mt-6" href="/admin/applications">Back to inbox</Link>
        </section>
      </div>
    );
  }

  const application = result.value.application;
  const updateResult = typeof query.update === 'string' ? query.update : '';
  const assignmentResult = typeof query.assignment === 'string' ? query.assignment : '';
  return (
    <div className="container page-shell py-10 sm:py-16">
      <section className="card mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin/applications" className="text-sm font-medium text-brand-primary">← Back to inbox</Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">{application.formType} application</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{application.name}</h1>
          </div>
          <AdminAuthButton action="sign-out" />
        </div>
        <dl className="mt-8 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Submitted</dt><dd className="mt-1 text-sm font-medium">{formatDate(application.submittedAt)}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Source</dt><dd className="mt-1 text-sm font-medium">{application.source}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-1 text-sm font-medium">{application.status}</dd></div>
          <div><dt className="text-xs uppercase tracking-wide text-slate-500">Assigned to</dt><dd className="mt-1 text-sm font-medium">{application.assignedTo ?? 'Unassigned'}</dd></div>
        </dl>
        {updateResult === 'saved' ? <p role="status" className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Status saved.</p> : null}
        {updateResult === 'stale' ? <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">This application changed after this page loaded. Review the current status before trying again.</p> : null}
        {updateResult === 'error' ? <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">Unable to update the application status. Please try again.</p> : null}
        {assignmentResult === 'saved' ? <p role="status" className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Assignment saved.</p> : null}
        {assignmentResult === 'stale' ? <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">This assignment changed after this page loaded. Review the current assignment before trying again.</p> : null}
        {assignmentResult === 'not-found' ? <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">This application is no longer available.</p> : null}
        {assignmentResult === 'error' ? <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">Unable to update the assignment. Please try again.</p> : null}
        <form action={updateAdminApplicationAssignment} className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end">
          <input type="hidden" name="applicationId" value={application.id} />
          <input type="hidden" name="expectedAssignmentRevision" value={application.assignmentRevision ?? ''} />
          <input type="hidden" name="mutationId" value={randomUUID()} />
          <label className="flex-1 space-y-1 text-sm font-medium text-slate-700">
            <span>Assign application</span>
            <select name="assignedTo" defaultValue={application.assignedTo ?? ''} className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900">
              <option value="">Unassigned</option>
              {application.assigneeOptions.map((email) => <option key={email} value={email}>{email}</option>)}
            </select>
          </label>
          <button type="submit" className="btn">Save assignment</button>
          {application.assignedAt && application.assignedBy ? (
            <p className="text-xs text-slate-500">Last changed by {application.assignedBy} on {formatDate(application.assignedAt)}</p>
          ) : null}
        </form>
        {isApplicationStatus(application.status) && application.revision ? (
          <form action={updateAdminApplicationStatus} className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end">
            <input type="hidden" name="applicationId" value={application.id} />
            <input type="hidden" name="expectedStatus" value={application.status} />
            <input type="hidden" name="expectedRevision" value={application.revision} />
            <input type="hidden" name="mutationId" value={randomUUID()} />
            <label className="flex-1 space-y-1 text-sm font-medium text-slate-700">
              <span>Update workflow status</span>
              <select name="status" defaultValue={application.status} className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900">
                {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <button type="submit" className="btn">Save status</button>
          </form>
        ) : null}
        <dl className="mt-5 divide-y divide-slate-100">
          {application.fields.map(({ label, value }) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[minmax(12rem,1fr)_2fr] sm:gap-5">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
