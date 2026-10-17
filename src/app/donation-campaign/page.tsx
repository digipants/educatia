import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Support an Education Campaign',
  description: 'Learn how to support Educatia Welfare Trust education initiatives and enquire about sponsorship opportunities.',
  path: '/donation-campaign',
  keywords: ['education sponsorship', 'support student education', 'Educatia Welfare Trust']
});

export default function DonationCampaignPage() {
  return (
    <div className="page-shell container py-12 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Support student learning</h1>
        <p className="text-slate-700 leading-relaxed">
          Educatia Welfare Trust seeks support for educational access, learning resources,
          mentoring, and guided academic support. Specific sponsorship opportunities and
          budgets can be discussed with the trust directly.
        </p>
      </section>
      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Sponsorship enquiries</h2>
        <p className="text-slate-700">
          Online donations are temporarily unavailable. Razorpay activation is pending
          submission and approval of required documents. Please do not attempt an
          online payment until the trust announces that donations have been enabled.
        </p>
        <p className="text-sm text-slate-600">
          Verified funding targets, beneficiary profiles, impact reports, and donation
          receipts will be published or provided when supported by trust records.
        </p>
        <Link href="/contact" className="btn inline-flex">
          Contact the trust
        </Link>
      </section>
    </div>
  );
}
