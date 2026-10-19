import Link from 'next/link';
import type { Metadata } from 'next';
import { randomUUID } from 'node:crypto';
import { listCmsGalleryPhotos } from '@/lib/cmsGalleryStore';
import { galleryCategories } from '@/lib/cmsGalleryContent';
import { CmsAccessActions } from '../CmsAccessActions';
import { CmsAuthButton } from '../CmsAuthButton';
import { createCmsGalleryDraftAction } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  title: 'Photo Gallery management',
  robots: { index: false, follow: false, noarchive: true }
};

const input = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
const categoryLabels: Record<string, string> = {
  'school-visits': 'School visits',
  'online-classes': 'Online classes',
  'volunteers-at-work': 'Volunteers at work',
  'student-participation': 'Student participation'
};
const statusPresentation: Record<string, { label: string; style: string }> = {
  draft: { label: 'Draft', style: 'bg-slate-100 text-slate-700' },
  review: { label: 'In review', style: 'bg-amber-100 text-amber-900' },
  published: { label: 'Published', style: 'bg-emerald-100 text-emerald-900' },
  archived: { label: 'Archived', style: 'bg-rose-100 text-rose-900' }
};

export default async function CmsGalleryDashboard({ searchParams }: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const [result, query] = await Promise.all([listCmsGalleryPhotos(), searchParams]);
  if (result.status !== 'ok') {
    return <div className="container page-shell py-12">
      <section className="card mx-auto max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Photo Gallery</h1>
        <p className="text-slate-600">{result.status === 'unavailable'
          ? 'Photo uploads are paused until the trust approves storage and safeguarding settings.'
          : result.status === 'unauthenticated' ? 'Sign in with an authorized Google account.'
            : result.status === 'unauthorized' ? 'This account cannot access the editorial workspace.'
              : 'The photo workspace could not be loaded. Please try later.'}</p>
        <CmsAccessActions status={result.status} />
      </section>
    </div>;
  }

  return <div className="container page-shell space-y-8 py-10 sm:py-16">
    <section className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm font-semibold text-brand-primary underline" href="/admin/content">← Editorial workspace</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-primary">Team content</p>
          <h1 className="mt-2 text-3xl font-semibold">Photo Gallery</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Drafts stay private until an independent publisher verifies the source and the relevant permissions.
            Never upload consent documents or include children's names or contact details.
          </p>
        </div>
        <CmsAuthButton action="sign-out" />
      </div>
      {query.notice === 'error' ? <p role="alert" className="text-sm text-rose-700">The photo draft could not be saved.</p> : null}
      {query.notice === 'saved' ? <p role="status" className="text-sm text-emerald-800">Changes saved.</p> : null}
    </section>

    <section className="card space-y-4" aria-labelledby="gallery-new-heading">
      <h2 id="gallery-new-heading" className="text-xl font-semibold">Start a photo draft</h2>
      <form action={createCmsGalleryDraftAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="postId" value={randomUUID()} />
        <label className="block space-y-1 text-sm font-medium">Title
          <input name="title" required maxLength={120} className={input} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Activity category
          <select name="category" required defaultValue="school-visits" className={input}>
            {galleryCategories.map(category => <option key={category} value={category}>{categoryLabels[category]}</option>)}
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium md:col-span-2">Short caption
          <textarea name="caption" required maxLength={300} rows={2} className={input} />
        </label>
        <label className="block space-y-1 text-sm font-medium md:col-span-2">Meaningful alternative text
          <input name="altText" required maxLength={180} className={input}
            aria-describedby="gallery-alt-help" />
          <span id="gallery-alt-help" className="block text-xs font-normal text-slate-600">Describe the relevant visual content; do not identify children.</span>
        </label>
        <label className="block space-y-1 text-sm font-medium">Activity date (optional)
          <input name="activityDate" type="date" className={input} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Display order
          <input name="displayOrder" type="number" min={0} max={9999} defaultValue={0} required className={input} />
        </label>
        <label className="block space-y-1 text-sm font-medium">Source / rights register reference
          <input name="sourceReference" required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
            className={input} aria-describedby="gallery-rights-help" />
          <span id="gallery-rights-help" className="block text-xs font-normal text-slate-600">Use an opaque internal reference only, not a name, phone, email or document.</span>
        </label>
        <label className="block space-y-1 text-sm font-medium">People shown
          <select name="subjectVisibility" required defaultValue="unknown" className={input}>
            <option value="none">No identifiable people</option>
            <option value="adults">Identifiable adults</option>
            <option value="minors">Identifiable minors</option>
            <option value="unknown">Not yet verified</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">Subject permission register reference
          <input name="subjectPermissionReference" maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
            className={input} aria-describedby="gallery-permission-help" />
          <span id="gallery-permission-help" className="block text-xs font-normal text-slate-600">Required for identifiable people. Do not upload or paste evidence here.</span>
        </label>
        <label className="block space-y-1 text-sm font-medium">Guardian permission reference
          <input name="guardianPermissionReference" maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
            className={input} aria-describedby="gallery-guardian-help" />
          <span id="gallery-guardian-help" className="block text-xs font-normal text-slate-600">Required for identifiable minors; publication remains separately disabled pending approval.</span>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn">Save private draft</button>
        </div>
      </form>
    </section>

    <section className="space-y-3" aria-labelledby="gallery-items-heading">
      <h2 id="gallery-items-heading" className="text-xl font-semibold">Photo drafts and submissions</h2>
      {result.value.map(photo => {
        const status = statusPresentation[photo.status] ?? statusPresentation.draft;
        return <Link href={`/admin/content/gallery/${photo.id}`} key={photo.id}
          className="card flex min-w-0 items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          {photo.mediaState === 'ready' ? <img src={`/api/cms/gallery/${photo.id}/media/thumbnail`} alt={photo.altText}
            loading="lazy" width={112} height={80} className="h-20 w-28 shrink-0 rounded-lg bg-slate-100 object-cover" />
            : <div aria-hidden="true" className="grid h-20 w-28 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <span className="font-semibold">{photo.title}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}>{status.label}</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {categoryLabels[photo.category] ?? 'Photo'} · {photo.mediaState === 'ready' ? 'Image ready' : 'Image ' + photo.mediaState}
              {' · '}Updated {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(photo.updatedAt))}
            </p>
          </div>
        </Link>;
      })}
      {!result.value.length ? <p className="card text-slate-600">No photo drafts or submissions yet.</p> : null}
    </section>
  </div>;
}
