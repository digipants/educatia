import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="page-shell container py-12 space-y-6">
      <h1 className="text-3xl font-semibold">Support Educatia Welfare Trust</h1>
      <div className="card space-y-4">
        <h2 className="text-xl font-semibold">Online donations are temporarily unavailable</h2>
        <p className="text-slate-700">
          Razorpay activation is pending submission and approval of required documents.
          Online payment will be available only after activation and our payment
          verification and donor acknowledgment processes are ready.
        </p>
        <p className="text-slate-700">
          For information about supporting our education programs, please contact the trust.
          No online payment is requested at this stage.
        </p>
        <Link href="/contact" className="btn inline-flex">Contact the trust</Link>
      </div>
    </div>
  );
}
