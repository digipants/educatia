import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Ways to Support Student Learning',
  description: 'Contact Educatia Welfare Trust to discuss supporting student learning and education programs.',
  path: '/donation-campaign',
  keywords: ['education sponsorship', 'support student education', 'Educatia Welfare Trust']
});

export default function DonationCampaignPage() {
  return (
    <div className="page-shell container py-12 space-y-8">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Support students</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Support student learning</h1>
        <p className="max-w-3xl leading-relaxed text-slate-700">
          Contact Educatia Welfare Trust to discuss supporting educational access, learning resources,
          mentoring, and guided academic programs.
        </p>
      </section>
      <section className="card max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Discuss supporting students</h2>
        <p className="leading-relaxed text-slate-700">
          Online donations are not available right now. Please contact our team to discuss supporting students.
        </p>
        <Link href="/contact" className="btn inline-flex">Contact our team</Link>
      </section>
    </div>
  );
}
