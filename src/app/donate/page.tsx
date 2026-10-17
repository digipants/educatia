import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="page-shell container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Support students</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Support Educatia Welfare Trust</h1>
        </header>
        <section className="card space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Online donations are not available right now.</h2>
          <p className="leading-relaxed text-slate-700">
            Please contact our team to discuss supporting students and learn about ways to get involved.
          </p>
          <Link href="/contact" className="btn inline-flex">Contact our team</Link>
        </section>
      </div>
    </div>
  );
}
