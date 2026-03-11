import Image from 'next/image';
import Link from 'next/link';

const support = [
  'Structured Study On Screen sessions',
  'Core subject strengthening and doubt clearing',
  'Regular practice, revision, and exam-oriented guidance',
  'Board exam preparation support',
  'Study discipline and time-management habits'
];

const outcomes = [
  'Improved marks and conceptual clarity',
  'Higher confidence and consistent study behavior',
  'Stronger foundation for higher education and career planning'
];

export default function AcademicsPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Academics</p>
          <h1 className="text-4xl font-bold text-slate-900">Free academic support for Class 9 to 12</h1>
          <p className="text-slate-700 leading-relaxed">
            This program is built to ensure no deserving student is left behind due to financial constraints.
            It strengthens board exam readiness through guided learning and disciplined study support.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1400&q=80"
            alt="Students studying in a classroom"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="card space-y-3">
          <h2 className="text-xl font-semibold">Who this is for</h2>
          <p className="text-sm text-slate-700">Class 9 to 12 students who need structured and free academic support.</p>
          <div className="relative h-40 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
              alt="Books and notebooks"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </article>

        <article className="card space-y-3">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {support.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Expected outcomes</h2>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"
              alt="Student writing notes"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/become-a-member" className="btn">
          Enroll Student
        </Link>
        <Link href="/contact" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Contact Team
        </Link>
      </section>
    </div>
  );
}
