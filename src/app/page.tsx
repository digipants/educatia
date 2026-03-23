import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ImpactStats from '@/components/ImpactStats';

const programMenu = [
  {
    title: "Academics",
    href: "/academics",
    description:
      "Free and structured support for Class 9 to 12 students with board exam preparation and doubt clearing.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Soft Skills",
    href: "/soft-skills",
    description:
      "Spoken English, personality enhancement, and public speaking to build confidence and leadership.",
    image:
      "https://images.unsplash.com/photo-1709290749293-c6152a187b14?q=80",
  },
  {
    title: "Skill Development",
    href: "/skill-development",
    description:
      "Practical job-oriented and entrepreneurship-focused skills for long-term self-reliance.",
    image:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=80",
  },
];

const highlights = [
  {
    title: 'No financial burden',
    detail: 'Programs are designed to remain completely free for eligible learners.',
    image:
      'https://images.unsplash.com/photo-1498079022511-d15614cb1c02?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Board-focused outcomes',
    detail: 'Academic sessions are aligned to improve exam performance and concept clarity.',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Beyond textbooks',
    detail: 'Soft skills and practical life skills are integrated with academic support.',
    image:
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80'
  }
];

export default function Home() {
  return (
    <div className="space-y-16 pb-4">
      <Hero />

      <section className="container grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="card overflow-hidden p-0">
            <div className="relative h-40">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </div>
            <div className="space-y-2 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="text-sm text-slate-700">{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="container grid gap-6 md:grid-cols-2 items-center">
        <article className="card space-y-3">
          <h2 className="text-2xl font-semibold">
            About Educatia Welfare Trust
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            Educatia Welfare Trust offers free educational support to Class 9 to
            12 students and strengthens learning through structured Study On
            Screen sessions. The trust also runs communication and skill
            development programs for wider age groups to build confidence,
            leadership, and employability.
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            The objective is to prepare learners for higher education, jobs, and
            real-world responsibilities by combining academic depth with
            practical life and career skills.
          </p>
        </article>
        <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1629306262232-1f854b4b0b13?q=80"
            alt="Students in learning session"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="container grid gap-6 md:grid-cols-2">
        <article className="card space-y-3">
          <h2 className="text-2xl font-semibold">Outcomes We Target</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            <li>Stronger board exam performance and study discipline.</li>
            <li>Better communication, confidence, and decision-making.</li>
            <li>
              Higher readiness for college, employment, and self-reliance.
            </li>
          </ul>
          <Link href="/programs" className="btn w-full md:w-auto text-center">
            Explore Programs
          </Link>
        </article>
        <article className="card p-0 overflow-hidden">
          <div className="relative h-full min-h-64">
            <Image
              src="https://images.unsplash.com/photo-1524069290683-0457abfe42c3?q=80"
              alt="Mentor guiding students"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </article>
      </section>

      <section className="container">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Programs
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {programMenu.map((item) => (
            <article key={item.title} className="card overflow-hidden p-0">
              <div className="relative h-44">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-700">{item.description}</p>
                <Link href={item.href} className="btn w-full text-center">
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 md:grid-cols-2">
        <article className="card p-0 overflow-hidden">
          <div className="relative h-52">
            <Image
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
              alt="Students supported by campaign"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="space-y-3 p-6">
            <h2 className="text-xl font-semibold">Current Campaign</h2>
            <p className="text-sm text-slate-700">
              Sponsor 1,000 students for one year by funding devices, learning
              access, and guided support.
            </p>
            <Link
              href="/donation-campaign"
              className="btn w-full md:w-auto text-center"
            >
              View Donation Campaign
            </Link>
          </div>
        </article>

        <article className="card p-0 overflow-hidden">
          <div className="relative h-52">
            <Image
              src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80"
              alt="News and updates"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="space-y-3 p-6">
            <h2 className="text-xl font-semibold">Latest News and Updates</h2>
            <p className="text-sm text-slate-700">
              Follow school visits, district launches, student milestones,
              volunteer stories, and exam outcomes.
            </p>
            <Link
              href="/news-updates"
              className="btn w-full md:w-auto text-center"
            >
              Read Updates
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
