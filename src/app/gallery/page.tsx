import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Gallery',
  description: 'Explore Educatia Welfare Trust program information and contact the team about photographs and activities.',
  path: '/gallery',
  keywords: ['Educatia Welfare Trust', 'education programs', 'learning activities']
});

export default function GalleryPage() {
  return (
    <div className="page-shell container py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Gallery</h1>
        <p className="max-w-2xl leading-relaxed text-slate-700">
          Photos from our activities will appear here when they are available
          to share. In the meantime, learn about our education programs and
          contact the team for more information.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/programs" className="btn">View programs</Link>
        <Link href="/contact" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Contact our team
        </Link>
      </div>
    </div>
  );
}
