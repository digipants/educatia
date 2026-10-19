import Link from 'next/link';
import type { Metadata } from 'next';
import { randomUUID } from 'node:crypto';
import { listCmsPosts } from '@/lib/cmsStore';
import { getCmsConfiguration } from '@/lib/cmsSecurity';
import { CmsAuthButton } from './CmsAuthButton';
import { CmsAccessActions, type CmsAccessStatus } from './CmsAccessActions';
import { createCmsDraftAction } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: 'Editorial workspace',
  robots: { index: false, follow: false, noarchive: true }
};

const classes = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
function Status({ status }: { status: CmsAccessStatus }) {
  const copy = status === 'unavailable' ? 'The editorial workspace is not yet available.'
    : status === 'unauthenticated' ? 'Sign in with an authorized Google account.'
      : status === 'unauthorized' ? 'This account cannot access the editorial workspace.'
        : 'The workspace could not be loaded. Please try later.';
  return <section className="card mx-auto max-w-xl space-y-4 text-center">
    <h1 className="text-2xl font-semibold">Educatia editorial workspace</h1>
    <p className="text-slate-600">{copy}</p>
    <CmsAccessActions status={status} />
  </section>;
}

export default async function CmsDashboard({ searchParams }: {
  searchParams: Promise<{ notice?: string | string[] }>
}) {
  const result = await listCmsPosts();
  const query = await searchParams;
  if (result.status !== 'ok') {
    return <div className="container page-shell py-12"><Status status={result.status} /></div>;
  }
  return <div className="container page-shell space-y-8 py-10 sm:py-16">
    <section className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Team content</p>
          <h1 className="mt-2 text-3xl font-semibold">Editorial workspace</h1>
          <p className="mt-2 text-sm text-slate-600">Prepare news and program updates. A separate reviewer approves publication.</p>
        </div>
        <CmsAuthButton action="sign-out" />
      </div>
      {!getCmsConfiguration(process.env).publishingEnabled ? (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          You can prepare and review drafts. Publishing is paused until the team finishes its access checks.
        </p>
      ) : null}
      {query.notice === 'error' ? <p role="alert" className="text-sm text-rose-700">The draft could not be created. Check the fields and try again.</p> : null}
    </section>
    <section className="card space-y-4" aria-labelledby="new-post-heading">
      <h2 id="new-post-heading" className="text-xl font-semibold">New draft</h2>
      <p className="text-sm text-slate-600">Use factual, approved wording only. Do not include names or images of children, private details, or unsupported results.</p>
      <form action={createCmsDraftAction} className="space-y-4">
        <input type="hidden" name="postId" value={randomUUID()} />
        <label className="block space-y-1 text-sm font-medium">Update type
          <select name="kind" className={classes} defaultValue="announcement">
            <option value="announcement">Announcement</option>
            <option value="program-update">Program update</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">Title
          <input name="title" required maxLength={120} className={classes} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Short summary
          <textarea name="summary" required maxLength={240} rows={2} className={classes} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Body (plain text only)
          <textarea name="body" required maxLength={4000} rows={7} className={classes} />
        </label>
        <button className="btn" type="submit">Save draft</button>
      </form>
    </section>
    <section className="space-y-3" aria-label="Content drafts and updates">
      <h2 className="text-xl font-semibold">Recent updates</h2>
      {result.value.map(post => (
        <Link href={`/admin/content/${post.id}`} key={post.id} className="card block">
          <div className="flex flex-wrap justify-between gap-3">
            <span className="font-semibold">{post.title}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{post.status}</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">{post.kind} · Updated {new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date(post.updatedAt))}</p>
        </Link>
      ))}
      {!result.value.length ? <p className="card text-slate-600">No drafts or updates yet.</p> : null}
    </section>
  </div>;
}
