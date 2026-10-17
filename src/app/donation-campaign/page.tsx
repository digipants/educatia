'use client';

import CampaignProgress from '@/components/CampaignProgress';
import Image from 'next/image';

export default function DonationCampaignPage() {

  const goal = {
    title: 'Sponsor 1,000 Students for 1 Year',
    problem:
      'Most of the students risk falling behind without devices, data, and live academic support. Many rely on shared phones, have patchy connectivity, and no guided practice after school restricts their ability to widen their thought sphere. To address this gap, we provide dedicated learning devices, data connectivity and live academic support, enabling students to learn without interruption.',
    breakdown: [
      { label: 'Tablet + protective case', amount: 5500 },
      { label: '1-year data pack', amount: 1800 },
      { label: 'Live classes & mentoring', amount: 3200 },
      { label: 'Monitoring & support', amount: 1500 }
    ],
    target: 500000,
    current: 320000,
    beneficiaries: [
      {
        name: 'Salma, Class 8',
        story: 'Wants to be a nurse; attends evening math labs daily.',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Rahul, Class 10',
        story: 'Preparing for board exams; needs stable device for practice tests.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Anjali, Class 6',
        story: 'Loves science kits; joins weekend maker sessions.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
      }
    ]
  };


  return (
    <div className="page-shell container py-12 space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{goal.title}</h1>
          <p className="text-slate-700 leading-relaxed">{goal.problem}</p>

          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Exact Cost Breakdown (per student)</h3>
            <ul className="divide-y divide-slate-100 text-sm">
              {goal.breakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between py-2">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-600">Every rupee is tracked; donors get impact updates quarterly.</p>
          </div>

          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Why this matters now</h3>
            <p className="text-sm leading-relaxed text-slate-700">
              This campaign funds devices, data, and live mentoring for students who would otherwise lose an academic year.
              Your support locks in a full year of consistent access—classes, practice, and doubt-solving.
            </p>
            <p className="rounded-lg bg-amber-50 p-4 text-sm text-slate-800">
              Online donations are temporarily unavailable because Razorpay
              activation is pending required documents and approval.
              Please contact the trust for sponsorship enquiries.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-600">The progress shown below is illustrative, not a live verified fundraising total.</p>
          <CampaignProgress current={goal.current} target={goal.target} />
          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Illustrative learner stories</h3>
            <p className="text-xs text-slate-600">These examples are not verified beneficiary profiles.</p>
            <div className="space-y-3">
              {goal.beneficiaries.map((b) => (
                <div key={b.name} className="flex gap-3 items-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-200">
                    <Image src={b.image} alt={b.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-slate-600">{b.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
