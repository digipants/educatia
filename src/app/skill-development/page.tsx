import Image from 'next/image';
import Link from 'next/link';
import { skillDevelopmentSubcategories } from '@/lib/programSubcategories';

export default function SkillDevelopmentPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Skill Development
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Practical skills that lead to livelihoods
          </h1>
          <p className="text-slate-700 leading-relaxed">
            Skill Development programs are practical and employment-oriented.
            They focus on hands-on learning, self-reliance, and career readiness
            so learners can secure jobs, start ventures, and contribute to
            long-term community growth.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"
            alt="Workshop and training session"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {skillDevelopmentSubcategories.map((program) => (
          <article key={program.slug} className="card flex gap-3 items-start">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg shrink-0">
              <Image
                src={program.image}
                alt={program.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {program.title}
              </h2>
              <p className="mt-1 text-sm text-slate-700">{program.highlight}</p>
              <Link
                href={`/skill-development/${program.slug}`}
                className="mt-2 inline-flex text-sm font-semibold text-sky-700 hover:underline"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Expected outcome</h2>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <p className="text-sm text-slate-700">
            Improved employability, stronger technical and professional
            confidence, and higher potential for self-employment and financial
            stability.
          </p>
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image
              src="https://plus.unsplash.com/premium_photo-1733342561505-306871f4e706?w=900&auto=format&fit=crop&q=80"
              alt="Learners using computers"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">All Courses</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {skillDevelopmentSubcategories.map((item) => (
            <Link
              key={item.slug}
              href={`/skill-development/${item.slug}`}
              className="rounded-lg border border-slate-200 p-3 text-sm hover:border-sky-300 hover:bg-sky-50 transition"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <Link href="/become-a-member" className="btn">
          Apply for Skill Development
        </Link>
      </section>
    </div>
  );
}
