import Image from 'next/image';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Programs',
  description:
    'Explore Educatia Welfare Trust programs in academics, soft skills, and skill development for learners seeking free support and practical growth.',
  path: '/programs',
  keywords: ['education programs', 'soft skills training', 'skill development NGO'],
  image:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
});

const menu = [
  {
    title: 'Academics',
    href: '/academics',
    summary:
      'Free board-focused academic support for Class 9 to 12 students from economically weaker backgrounds through structured Study On Screen sessions.',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Soft Skills',
    href: '/soft-skills',
    summary:
      'Spoken English, personality enhancement, and public speaking designed to improve confidence, communication, and leadership.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Skill Development',
    href: '/skill-development',
    summary:
      'Practical employability and self-reliance programs across digital, vocational, entrepreneurship, rural, and service sectors.',
    image:
      'https://images.unsplash.com/photo-1581091215367-59ab6dcef1f8?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function ProgramsPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Programs</p>
          <h1 className="text-4xl font-bold text-slate-900">Learn with structure. Grow with purpose.</h1>
          <p className="text-slate-700 leading-relaxed">
            Educatia Welfare Trust runs free and practical learning programs that combine academic support,
            communication strength, and career-oriented skills. Each program is designed for real outcomes in
            education, employability, and long-term self-reliance.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80"
            alt="Students and mentors in a classroom"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {menu.map((item) => (
          <article key={item.title} className="card overflow-hidden p-0">
            <div className="relative h-44">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
            </div>
            <div className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
              <Link href={item.href} className="btn w-full text-center">
                Explore {item.title}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
