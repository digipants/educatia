import Link from 'next/link';

interface DonationCardProps {
  title: string;
  description: string;
  amount: number;
}

export default function DonationCard({ title, description, amount }: DonationCardProps) {
  return (
    <div className="card space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-slate-700">{description}</p>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</p>
        <Link className="btn" href="/donate">Donate</Link>
      </div>
    </div>
  );
}
