import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';
import { listPublishedCmsPosts } from '@/lib/cmsStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = createPageMetadata({
  title: 'News and Updates',
  description: 'Find Educatia Welfare Trust program information and contact the team about current activities and announcements.',
  path: '/news-updates',
  keywords: ['Educatia Welfare Trust news', 'education program information', 'community education']
});

export default async function NewsUpdatesPage() {
  const posts = await listPublishedCmsPosts();
  return <div className="page-shell container space-y-6 py-12">
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold">News &amp; Updates</h1>
      <p className="max-w-2xl leading-relaxed text-slate-700">
        Find announcements and program updates from Educatia Welfare Trust.
      </p>
    </div>
    {posts.length ? (
      <section aria-label="Published updates" className="space-y-4">
        {posts.map(post => (
          <article key={post.id} className="card space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              {post.kind === 'announcement' ? 'Announcement' : 'Program update'}
              {' · '}
              <time dateTime={post.publishedAt}>
                {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(post.publishedAt))}
              </time>
            </p>
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p className="font-medium text-slate-800">{post.summary}</p>
            <p className="whitespace-pre-line break-words leading-relaxed text-slate-700">{post.body}</p>
          </article>
        ))}
      </section>
    ) : <p className="max-w-2xl text-slate-700">
      Program news and activity updates will be shared here when available.
      Explore our programs or contact the team about current opportunities.
    </p>}
    <nav className="flex flex-wrap gap-3" aria-label="Find more information">
      <Link href="/programs" className="btn">Explore programs</Link>
      <Link href="/contact" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
        Contact Educatia
      </Link>
    </nav>
  </div>;
}
