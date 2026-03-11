import Image from 'next/image';
import Link from 'next/link';

const modules = [
  {
    title: 'Spoken English',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    points: [
      'Vocabulary building and pronunciation clarity',
      'Sentence formation and conversation practice',
      'Confidence for interviews, meetings, and daily communication'
    ]
  },
  {
    title: 'Personality Enhancement',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    points: [
      'Self-confidence, positive attitude, and leadership behavior',
      'Body language, emotional balance, and decision-making',
      'Teamwork, communication, and disciplined habits'
    ]
  },
  {
    title: 'Public Speaking Program',
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    points: [
      'Stage fear reduction through guided speaking practice',
      'Speech structure, voice modulation, and audience engagement',
      'Readiness for presentations, debates, seminars, and leadership roles'
    ]
  }
];

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
        {modules.map((module) => (
          <article key={module.title} className="card overflow-hidden p-0">
            <div className="relative h-44">
              <Image src={module.image} alt={module.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="space-y-3 p-6">
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {module.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="card space-y-2">
        <h2 className="text-xl font-semibold">Who should join</h2>
        <p className="text-sm text-slate-700">
          Students, job seekers, and working professionals who want stronger communication, better presence,
          and confidence in public and professional environments.
        </p>
      </section>

      <section>
        <Link href="/become-a-member" className="btn">
          Join Soft Skills Program
        </Link>
      </section>
    </div>
  );
}
