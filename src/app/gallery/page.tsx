import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';
import { listPublishedCmsGalleryPhotos } from '@/lib/cmsGalleryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = createPageMetadata({
  title: 'Gallery',
  description: 'View photographs approved for publication by Educatia Welfare Trust.',
  path: '/gallery',
  keywords: ['Educatia Welfare Trust', 'education programs', 'learning activities']
});

const categoryLabels: Record<string, string> = {
  'school-visits': 'School visits',
  'online-classes': 'Online classes',
  'volunteers-at-work': 'Volunteers at work',
  'student-participation': 'Student participation'
};

export default async function GalleryPage() {
  const photos = await listPublishedCmsGalleryPhotos();

  return <div className="page-shell container space-y-8 py-12 sm:py-16">
    <header className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Educatia in action</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Gallery</h1>
      <p className="leading-relaxed text-slate-700">
        Browse photographs approved for sharing by the Educatia team. Each image opens an accessible larger preview.
      </p>
    </header>

    {photos.length ? <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Approved activity photographs">
      {photos.map(photo => <li key={photo.id} className="card min-w-0 space-y-3 p-3">
        <details className="group">
          <summary className="cursor-zoom-in list-none rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            <span className="sr-only">Open larger preview: {photo.altText}</span>
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img src={`/api/cms/gallery/${photo.id}/media/thumbnail`} alt={photo.altText}
                loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-open:scale-[1.02]" />
            </div>
            <span className="mt-2 inline-block text-xs font-semibold text-brand-primary underline">View larger image</span>
          </summary>
          <figure className="mt-3 space-y-2">
            <img src={`/api/cms/gallery/${photo.id}/media/display`} alt={photo.altText}
              loading="lazy" decoding="async" className="max-h-[75vh] w-full rounded-lg bg-slate-100 object-contain" />
            <figcaption className="text-sm leading-relaxed text-slate-700">{photo.caption}</figcaption>
          </figure>
        </details>
        <div>
          <h2 className="font-semibold text-slate-900">{photo.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{photo.caption}</p>
        </div>
        <p className="flex flex-wrap gap-x-2 text-xs text-slate-600">
          <span>{categoryLabels[photo.category] ?? 'Activity'}</span>
          {photo.activityDate ? <>
            <span aria-hidden="true">·</span>
            <time dateTime={photo.activityDate}>{new Intl.DateTimeFormat('en-IN', {
              dateStyle: 'medium', timeZone: 'UTC'
            }).format(new Date(`${photo.activityDate}T00:00:00.000Z`))}</time>
          </> : null}
        </p>
      </li>)}
    </ul> : <section className="card space-y-4" aria-labelledby="gallery-empty-heading">
      <h2 id="gallery-empty-heading" className="text-xl font-semibold">More moments coming soon</h2>
      <p className="max-w-2xl leading-relaxed text-slate-700">
        There are no approved photographs to display right now. We share images here only after they have been reviewed and approved.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/programs" className="btn">Explore programs</Link>
        <Link href="/contact" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Contact our team
        </Link>
      </div>
    </section>}
  </div>;
}
