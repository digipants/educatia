import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cmsRoleForEmail } from '@/lib/cmsStore';
import { getCmsGalleryConfiguration } from '@/lib/cmsGallerySecurity';
import { readCmsGalleryPhoto } from '@/lib/cmsGalleryStore';
import { galleryReviewReasonLabels, galleryReviewReasons } from '@/lib/cmsGalleryContent';
import { CmsAccessActions } from '../../CmsAccessActions';
import { CmsAuthButton } from '../../CmsAuthButton';
import { GalleryUploader } from '../GalleryUploader';
import {
  archiveCmsGalleryPhotoAction, editCmsGalleryDraftAction, publishCmsGalleryPhotoAction,
  purgeCmsGalleryPhotoAction, retryCmsGalleryCleanupAction, returnCmsGalleryDraftAction,
  submitCmsGalleryReviewAction
} from '../actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Review gallery photo', robots: { index: false, follow: false, noarchive: true } };

const input = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
const categoryLabels: Record<string, string> = {
  'school-visits': 'School visits',
  'online-classes': 'Online classes',
  'volunteers-at-work': 'Volunteers at work',
  'student-participation': 'Student participation'
};
const eventLabels: Record<string, string> = {
  submitted: 'Submitted for independent review',
  returned: 'Returned for corrections',
  published: 'Published',
  archived: 'Archived / unpublished'
};

export default async function CmsGalleryPhotoPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await readCmsGalleryPhoto(id);
  if (result.status !== 'ok') return <div className="container page-shell py-16">
    <section className="card mx-auto max-w-xl space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Photo Gallery</h1>
      <p>{result.status === 'unavailable' ? 'Photo uploads are currently paused.'
        : result.status === 'unauthenticated' ? 'Sign in with your team Google account.'
          : result.status === 'unauthorized' ? 'This account is not authorized.'
            : 'Unable to load this photo.'}</p>
      <CmsAccessActions status={result.status} />
    </section>
  </div>;
  if (!result.value) return <div className="container page-shell py-16"><section className="card space-y-4">
    <h1 className="text-2xl font-semibold">Photo not found</h1><CmsAccessActions status="not-found" />
  </section></div>;

  const photo = result.value;
  const session = await getServerSession(authOptions);
  const role = cmsRoleForEmail(session?.user?.email);
  const publisher = role === 'publisher';
  const galleryConfig = getCmsGalleryConfiguration(process.env);
  const editable = photo.status === 'draft';

  return <div className="container page-shell space-y-6 py-10 sm:py-16">
    <section className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-brand-primary underline" href="/admin/content/gallery">← Photo Gallery</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-primary">{photo.status}</p>
          <h1 className="mt-2 text-3xl font-semibold">{photo.title}</h1>
          <p className="mt-2 text-xs text-slate-600">Category: {categoryLabels[photo.category] ?? photo.category} · Created by {photo.authorEmail}</p>
      {photo.reviewFeedback ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Publisher feedback: {galleryReviewReasonLabels[photo.reviewFeedback] ?? 'Please review the photo details.'}
      </p> : null}
        </div>
        <CmsAuthButton action="sign-out" />
      </div>
      {query.notice === 'saved' ? <p role="status" className="text-sm text-emerald-800">Changes saved.</p> : null}
      {query.notice === 'stale' ? <p role="alert" className="text-sm text-amber-800">This photo changed. Refresh before trying again.</p> : null}
      {query.notice === 'error' ? <p role="alert" className="text-sm text-rose-800">Unable to save this change. Check the form or permissions.</p> : null}
      {query.notice === 'cleanup-pending' ? <p role="status" className="text-sm text-amber-900">The photo is no longer public, but storage cleanup needs another attempt.</p> : null}
      {photo.status === 'review' && !galleryConfig.publishingEnabled ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Gallery publication is paused. Draft review can continue, but public media remains disabled.
      </p> : null}
    </section>

    {photo.mediaState === 'ready' ? <section className="card space-y-3" aria-labelledby="photo-preview-heading">
      <h2 id="photo-preview-heading" className="text-xl font-semibold">Private image preview</h2>
      <img src={`/api/cms/gallery/${photo._id}/media/display`} alt={photo.altText}
        className="max-h-[70vh] w-full rounded-xl bg-slate-100 object-contain" />
      <p className="text-sm text-slate-700">{photo.caption}</p>
    </section> : <section className="card space-y-2" role="status">
      <h2 className="text-lg font-semibold">Image status</h2>
      <p className="text-sm text-slate-600">{photo.mediaState === 'pending' ? 'An upload is incomplete. If it remains pending, reload and retry the image after 15 minutes.'
        : photo.mediaState === 'purging' ? 'Storage deletion is incomplete. Retry the permanent deletion.'
          : photo.mediaState === 'purged' ? 'Media objects have been removed.' : 'No image has been uploaded yet.'}</p>
    </section>}

    {editable ? <>
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Edit photo details</h2>
        <form action={editCmsGalleryDraftAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="postId" value={photo._id} />
          <input type="hidden" name="expectedRevision" value={photo.revision} />
          <label className="block space-y-1 text-sm font-medium">Title
            <input name="title" required maxLength={120} defaultValue={photo.title} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Category
            <select name="category" required defaultValue={photo.category} className={input}>
              {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium md:col-span-2">Short caption
            <textarea name="caption" required maxLength={300} rows={2} defaultValue={photo.caption} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium md:col-span-2">Meaningful alternative text
            <input name="altText" required maxLength={180} defaultValue={photo.altText} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Activity date (optional)
            <input name="activityDate" type="date" defaultValue={photo.activityDate ?? ''} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Display order
            <input name="displayOrder" type="number" min={0} max={9999} required defaultValue={photo.displayOrder} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Source / rights register reference
            <input name="sourceReference" required maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
              defaultValue={photo.sourceReference} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">People shown
            <select name="subjectVisibility" required defaultValue={photo.subjectVisibility} className={input}>
              <option value="none">No identifiable people</option><option value="adults">Identifiable adults</option>
              <option value="minors">Identifiable minors</option><option value="unknown">Not yet verified</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium">Subject permission register reference
            <input name="subjectPermissionReference" maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
              defaultValue={photo.subjectPermissionReference} className={input} />
          </label>
          <label className="block space-y-1 text-sm font-medium">Guardian permission reference
            <input name="guardianPermissionReference" maxLength={80} pattern="[A-Za-z0-9][A-Za-z0-9._/-]{1,79}"
              defaultValue={photo.guardianPermissionReference} className={input} />
          </label>
          <div className="md:col-span-2"><button type="submit" className="btn">Save photo details</button></div>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Private image upload</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Only genuine Educatia activity photos are allowed. The server checks the file signature, decodes and re-encodes it,
          strips embedded metadata, and stores only private optimized WebP variants. Do not upload photos without the required records.
        </p>
        <GalleryUploader photoId={photo._id} revision={photo.revision} />
      </section>
      {photo.mediaState === 'ready' ? <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Request independent review</h2>
        <p className="text-sm text-slate-600">Confirm the source and required permission-register references are present. The Publisher must inspect those records separately; no free-text note is stored here.</p>
        <form action={submitCmsGalleryReviewAction} className="space-y-3">
          <input type="hidden" name="postId" value={photo._id} />
          <input type="hidden" name="expectedRevision" value={photo.revision} />
          <button type="submit" className="btn">Submit for review</button>
        </form>
      </section> : null}
    </> : null}

    <section className="card space-y-4" aria-labelledby="permissions-heading">
      <h2 id="permissions-heading" className="text-xl font-semibold">Source and permission checks</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold">Source register</dt><dd className="mt-1 text-slate-700">{photo.sourceReference}</dd></div>
        <div><dt className="font-semibold">People shown</dt><dd className="mt-1 text-slate-700">{photo.subjectVisibility}</dd></div>
        <div><dt className="font-semibold">Subject permission reference</dt><dd className="mt-1 text-slate-700">{photo.subjectPermissionReference || 'Not applicable / not supplied'}</dd></div>
        <div><dt className="font-semibold">Guardian permission reference</dt><dd className="mt-1 text-slate-700">{photo.guardianPermissionReference || 'Not applicable / not supplied'}</dd></div>
        <div><dt className="font-semibold">Publisher rights verification</dt><dd className="mt-1 text-slate-700">{photo.rightsReview ? `Verified by ${photo.rightsReview.verifiedBy}` : 'Not verified'}</dd></div>
        <div><dt className="font-semibold">Public metadata privacy review</dt><dd className="mt-1 text-slate-700">{photo.metadataReview ? `Verified by ${photo.metadataReview.verifiedBy}` : 'Not verified'}</dd></div>
        <div><dt className="font-semibold">Subject permission verification</dt><dd className="mt-1 text-slate-700">{photo.subjectVisibility === 'none'
          ? photo.metadataReview ? `Not applicable; people classification checked by ${photo.metadataReview.verifiedBy}` : 'Not applicable / not reviewed'
          : photo.consentReview ? `Verified by ${photo.consentReview.verifiedBy}` : 'Not verified'}</dd></div>
        <div><dt className="font-semibold">Guardian permission verification</dt><dd className="mt-1 text-slate-700">{photo.subjectVisibility !== 'minors'
          ? 'Not applicable' : photo.guardianReview ? `Verified by ${photo.guardianReview.verifiedBy}` : 'Not verified'}</dd></div>
      </dl>
      <p className="text-xs leading-relaxed text-slate-600">References identify records in the trust's separate permission register. This CMS stores no permission files or subject contact details. Verification requires inspecting that register; these fields are not legal proof.</p>
    </section>

    {photo.status === 'review' && publisher ? <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Independent Publisher review</h2>
      {!galleryConfig.publishingEnabled ? <p role="status" className="text-sm text-slate-600">Publishing is disabled by the current feature gates.</p> : <form action={publishCmsGalleryPhotoAction} className="space-y-3">
        <input type="hidden" name="postId" value={photo._id} />
        <input type="hidden" name="expectedRevision" value={photo.revision} />
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input name="sourceVerified" type="checkbox" value="yes" required className="mt-1" />
          <span>I inspected the source/rights register and confirmed this is a genuine activity photo approved for public use.</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input name="metadataPrivacyVerified" type="checkbox" value="yes" required className="mt-1" />
          <span>I confirmed the title, caption and alternative text contain no child names, student IDs, contact details or private information.</span>
        </label>
        <label className="block space-y-1 text-sm font-medium">People classification / permission check
          <select name="subjectPermissionVerified" defaultValue="no" required className={input}>
            <option value="no">Not verified</option><option value="yes">Verified in register or confirmed no identifiable people</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">Guardian permission status
          <select name="guardianPermissionVerified" defaultValue="no" required className={input}>
            <option value="no">Not verified / not applicable</option><option value="yes">Verified in the approved register</option>
          </select>
        </label>
        {photo.subjectVisibility === 'unknown' ? <p role="alert" className="text-sm text-rose-800">Publication is blocked until the people shown are classified.</p> : null}
        {photo.subjectVisibility === 'minors' && !galleryConfig.minorPublishingEnabled ? <p role="alert" className="text-sm text-rose-800">Publication of identifiable minors is disabled pending an approved safeguarding and guardian-permission process.</p> : null}
        <p className="text-xs leading-relaxed text-slate-600">The controls record who reviewed existing records; a checkbox is not consent evidence. Publishing is blocked when required references or independent checks are missing.</p>
        <button type="submit" className="btn">Approve and publish</button>
      </form>}
      <form action={returnCmsGalleryDraftAction} className="space-y-3 border-t border-slate-100 pt-4">
        <input type="hidden" name="postId" value={photo._id} />
        <input type="hidden" name="expectedRevision" value={photo.revision} />
        <label className="block space-y-1 text-sm font-medium">Return for corrections
          <select name="feedback" required defaultValue="" className={input}>
            <option value="" disabled>Select a reason</option>
            {galleryReviewReasons.map(reason => <option key={reason} value={reason}>{galleryReviewReasonLabels[reason]}</option>)}
          </select>
        </label>
        <button type="submit" className="btn">Return to draft</button>
      </form>
    </section> : null}

    {photo.status === 'published' && publisher ? <section className="card space-y-3">
      <h2 className="text-xl font-semibold">Unpublish</h2>
      <p className="text-sm text-slate-600">Archiving removes this photo from the public Gallery. The private media remains available to authorized staff.</p>
      <form action={archiveCmsGalleryPhotoAction}>
        <input type="hidden" name="postId" value={photo._id} />
        <input type="hidden" name="expectedRevision" value={photo.revision} />
        <button type="submit" className="btn">Archive / unpublish</button>
      </form>
    </section> : null}

    {photo.cleanupPending && editable ? <section className="card space-y-3">
      <h2 className="text-lg font-semibold">Storage cleanup needed</h2>
      <p className="text-sm text-slate-600">A previous replacement left private objects queued for removal. Finish cleanup before uploading another replacement.</p>
      <form action={retryCmsGalleryCleanupAction}>
        <input type="hidden" name="postId" value={photo._id} />
        <input type="hidden" name="expectedRevision" value={photo.revision} />
        <button type="submit" className="btn">Retry private storage cleanup</button>
      </form>
    </section> : null}

    {photo.status === 'archived' && publisher ? <section className="card space-y-3">
      <h2 className="text-xl font-semibold">Permanent removal</h2>
      <p className="text-sm text-slate-600">This permanently removes the archived CMS record and its tracked private objects. It cannot be undone through the CMS.</p>
      <form action={purgeCmsGalleryPhotoAction} className="space-y-3">
        <input type="hidden" name="postId" value={photo._id} />
        <input type="hidden" name="expectedRevision" value={photo.revision} />
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="confirmPurge" value="yes" required className="mt-1" />
          <span>I confirmed this photo is archived and approve permanent removal of this record and its private media.</span>
        </label>
        <button type="submit" className="btn bg-rose-700 hover:bg-rose-800">Delete photo permanently</button>
      </form>
    </section> : null}

    {photo.history.length ? <section className="card space-y-3" aria-labelledby="gallery-history-heading">
      <h2 id="gallery-history-heading" className="text-xl font-semibold">Editorial activity</h2>
      <ol className="space-y-2">
        {photo.history.map((entry, index) => <li key={`${entry.event}-${entry.at.toISOString()}-${index}`} className="border-l-2 border-slate-200 pl-3 text-sm">
          <p className="font-medium">{eventLabels[entry.event] ?? 'Editorial update'}</p>
          <p className="text-xs text-slate-600">{entry.actorEmail} · {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(entry.at))}</p>
        </li>)}
      </ol>
    </section> : null}
  </div>;
}
