import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'News and Updates',
  description: 'Find Educatia Welfare Trust program information and contact the team about current activities and announcements.',
  path: '/news-updates',
  keywords: ['Educatia Welfare Trust news', 'education program information', 'community education']
});

export default function NewsUpdatesPage() {
  return (
    <div className="page-shell container py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">News &amp; Updates</h1>
        <p className="max-w-2xl text-slate-700 leading-relaxed">
          Program news and activity updates will be shared here when available.
          For current learning opportunities and ways to participate, explore
          our programs or get in touch with the team.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/programs" className="btn">Explore programs</Link>
        <Link href="/contact" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Contact Educatia
        </Link>
      </div>
    </div>
  );
}
