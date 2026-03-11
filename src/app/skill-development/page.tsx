import Image from 'next/image';
import Link from 'next/link';

const programs = [
  'Digital and IT Skills',
  'Employment Oriented Vocational Courses',
  'Entrepreneurship and Business Skills',
  'Green Jobs and Sustainability',
  'Agriculture and Rural Skills',
  'Food Industry and Culinary Skills',
  'Financial and Corporate Skills',
  'Law and Public Service Support',
  'Tourism and Tour Guide Training',
  'Beauty and Wellness'
];

const visuals = [
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80'
];

export default function SkillDevelopmentPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Skill Development</p>
          <h1 className="text-4xl font-bold text-slate-900">Practical skills that lead to livelihoods</h1>
          <p className="text-slate-700 leading-relaxed">
            Skill Development programs are practical and employment-oriented. They focus on hands-on learning,
            self-reliance, and career readiness so learners can secure jobs, start ventures, and contribute to
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
        {programs.map((program, index) => (
          <article key={program} className="card flex gap-3 items-start">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg shrink-0">
              <Image
                src={visuals[index % visuals.length]}
                alt={program}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{program}</h2>
              <p className="mt-1 text-sm text-slate-700">
                Practical training aligned with current market needs and real-world application.
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Expected outcome</h2>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <p className="text-sm text-slate-700">
            Improved employability, stronger technical and professional confidence, and higher potential for
            self-employment and financial stability.
          </p>
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1584697964154-ff8235f6b0c4?auto=format&fit=crop&w=1200&q=80"
              alt="Learners using computers"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
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
