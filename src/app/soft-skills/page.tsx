import Image from 'next/image';
import Link from 'next/link';
import { softSkillsSubcategories } from '@/lib/programSubcategories';

export default function SoftSkillsPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Soft Skills</p>
          <h1 className="text-4xl font-bold text-slate-900">Confidence, communication, and leadership</h1>
          <p className="text-slate-700 leading-relaxed">
            This program develops communication strength and personal effectiveness for learners across
            age groups. It transforms hesitation into confidence for academics, careers, and social settings.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"
            alt="Team communication workshop"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {softSkillsSubcategories.map((module) => (
          <article key={module.slug} className="card overflow-hidden p-0">
            <div className="relative h-44">
              <Image src={module.image} alt={module.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{module.highlight}</p>
              <Link href={`/soft-skills/${module.slug}`} className="btn w-full text-center">
                View details
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">All Courses</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {softSkillsSubcategories.map((module) => (
            <Link key={module.slug} href={`/soft-skills/${module.slug}`} className="rounded-lg border border-slate-200 p-3 text-sm hover:border-sky-300 hover:bg-sky-50 transition">
              {module.title}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <Link href="/become-a-member" className="btn">
          Join Soft Skills Program
        </Link>
      </section>
    </div>
  );
}
