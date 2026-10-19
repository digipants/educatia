import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { readCmsPost, cmsRoleForEmail } from '@/lib/cmsStore';
import { getCmsConfiguration } from '@/lib/cmsSecurity';
import { authOptions } from '@/lib/auth';
import { cmsReviewReasons, type CmsReviewReason } from '@/lib/cmsContent';
import { CmsAuthButton } from '../CmsAuthButton';
import { CmsAccessActions } from '../CmsAccessActions';
import {
  editCmsDraftAction, submitCmsReviewAction, publishCmsPostAction, archiveCmsPostAction, returnCmsDraftAction
} from '../actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Review content', robots: { index: false, follow: false, noarchive: true } };
const input = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
const reviewReasonLabels: Record<CmsReviewReason, string> = {
  'source-needs-verification': 'Source needs verification',
  'claim-needs-support': 'A claim needs supporting evidence',
  'privacy-review-needed': 'Privacy review needed',
  'content-correction-needed': 'Content correction needed'
};

export default async function CmsEditPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const result = await readCmsPost(id);
  if (result.status !== 'ok') {
    return <section className="container page-shell py-16"><div className="card space-y-4">
      <h1 className="text-2xl font-semibold">Editorial workspace</h1>
      <p>{result.status === 'unavailable' ? 'The workspace is currently unavailable.'
        : result.status === 'unauthenticated' ? 'Sign in with your team Google account.'
          : result.status === 'unauthorized' ? 'This account is not authorized.'
            : 'Unable to load this content.'}</p>
      <CmsAccessActions status={result.status} />
    </div></section>;
  }
  if (!result.value) return <div className="container page-shell py-16"><div className="card">
    <h1 className="text-2xl font-semibold">Content not found</h1>
    <CmsAccessActions status="not-found" />
  </div></div>;
  const post = result.value;
  const session = await getServerSession(authOptions);
  const publisher = cmsRoleForEmail(session?.user?.email) === 'publisher';
  const mayPublish = publisher && getCmsConfiguration(process.env).publishingEnabled;
  const sameAuthor = post.authorEmail.trim().toLowerCase() === session?.user?.email?.trim().toLowerCase();
  const reviewFeedback = post.reviewFeedback
    ? reviewReasonLabels[post.reviewFeedback as CmsReviewReason] ?? post.reviewFeedback
    : '';
  return <div className="container page-shell space-y-6 py-10 sm:py-16">
    <section className="card space-y-4">
      <Link className="text-sm font-semibold text-brand-primary underline" href="/admin/content">← Editorial workspace</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">{post.status}</p>
          <h1 className="mt-2 text-3xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-xs text-slate-600">Created by {post.authorEmail} · Type: {post.kind}</p>
        </div>
        <CmsAuthButton action="sign-out" />
      </div>
      {query.notice === 'saved' ? <p role="status" className="text-sm text-emerald-800">Changes saved.</p> : null}
      {query.notice === 'stale' ? <p role="alert" className="text-sm text-amber-800">The item changed after this page was loaded. Refresh before trying again.</p> : null}
      {query.notice === 'error' ? <p role="alert" className="text-sm text-rose-800">Unable to save this change. Check the form or permissions.</p> : null}
    </section>
    {post.status === 'draft' ? <>
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Edit draft</h2>
        {reviewFeedback ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Reviewer feedback: {reviewFeedback}
        </p> : null}
        <form action={editCmsDraftAction} className="space-y-4">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="expectedRevision" value={post.revision} />
          <label className="block space-y-1 text-sm font-medium">Update type
            <select name="kind" defaultValue={post.kind} className={input}>
              <option value="announcement">Announcement</option>
              <option value="program-update">Program update</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium">Title
            <input name="title" defaultValue={post.title} maxLength={120} required className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Summary
            <textarea name="summary" defaultValue={post.summary} maxLength={240} required rows={2} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Body (plain text)
            <textarea name="body" defaultValue={post.body} maxLength={4000} required rows={8} className={input} />
          </label>
          <button type="submit" className="btn">Save changes</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Submit for review</h2>
        <p className="text-sm text-slate-600">Save your changes first. Enter only the opaque source-register reference; never put names, contact details, consent records, or free-text notes here.</p>
        <form action={submitCmsReviewAction} className="space-y-3">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="expectedRevision" value={post.revision} />
          <label className="block space-y-1 text-sm font-medium">Source-register reference (internal)
            <input name="evidenceNote" required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
              autoComplete="off" className={input} aria-describedby="source-reference-help" />
            <span id="source-reference-help" className="block text-xs font-normal text-slate-600">
              Use an opaque reference from the trust&apos;s source register, not the source text itself.
            </span>
          </label>
          <button type="submit" className="btn">Request review</button>
        </form>
      </section>
    </> : <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Content preview</h2>
      <p className="font-medium text-slate-900">{post.summary}</p>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{post.body}</p>
      <div className="border-t border-slate-200 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Internal source-register reference</p>
        <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700">{post.evidenceNote || 'None recorded'}</p>
      </div>
      {post.status === 'review' ? (
        mayPublish ? sameAuthor ? (
          <p className="text-sm text-slate-600">A different publisher must approve this draft.</p>
        ) : <form action={publishCmsPostAction} className="space-y-3 border-t border-slate-100 pt-4">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="expectedRevision" value={post.revision} />
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">Publisher checks</legend>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input name="sourceVerified" type="checkbox" value="yes" required className="mt-1" />
              <span>I checked the referenced source record and it supports this update.</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input name="claimsAccurate" type="checkbox" value="yes" required className="mt-1" />
              <span>I checked factual claims, dates, and figures against the source; unsupported outcomes are not stated as facts.</span>
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input name="privacyReviewed" type="checkbox" value="yes" required className="mt-1" />
              <span>I checked that no child is identifiable and no personal or sensitive details are exposed; any exceptional child-related mention has separately documented safeguarding approval.</span>
            </label>
          </fieldset>
          <button className="btn" type="submit">Approve and publish</button>
        </form> : <p className="text-sm text-slate-600">
          {publisher && !getCmsConfiguration(process.env).publishingEnabled
            ? 'Publishing is paused. You can still return this item for correction.'
            : "Awaiting a publisher's review."}
        </p>
      ) : null}
      {post.status === 'published' && publisher ? (
        <form action={archiveCmsPostAction} className="border-t border-slate-100 pt-4">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="expectedRevision" value={post.revision} />
          <button type="submit" className="btn">Archive / unpublish</button>
        </form>
      ) : null}
      {post.status === 'review' && publisher ? (
        <form action={returnCmsDraftAction} className="space-y-3 border-t border-slate-100 pt-4">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="expectedRevision" value={post.revision} />
          <label className="block space-y-1 text-sm font-medium">Return reason
            <select name="reason" required defaultValue="" className={input}>
              <option value="" disabled>Select a reason</option>
              {cmsReviewReasons.map(reason => <option key={reason} value={reason}>{reviewReasonLabels[reason]}</option>)}
            </select>
          </label>
          <button className="btn" type="submit">Return to draft</button>
        </form>
      ) : null}
      {post.status === 'archived' ? <p className="text-sm text-slate-600">This item is no longer public.</p> : null}
    </section>}
  </div>;
}
