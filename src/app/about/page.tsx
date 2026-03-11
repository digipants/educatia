import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">About Us</p>
          <h1 className="text-4xl font-bold text-slate-900">Education is a right, not a privilege</h1>
          <p className="text-slate-700 leading-relaxed">
            Educatia Welfare Trust is a non-profit initiative focused on providing completely free education
            support to students from economically weaker and underprivileged families. We remove financial
            barriers so deserving students can build secure and successful futures.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80"
            alt="Students learning with books"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Vision and Mission</h2>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <div className="space-y-2">
            <p className="text-slate-700 leading-relaxed">
              Education breaks the cycle of poverty and creates a brighter future. Through our Study On Screen
              Program, we make quality learning accessible, structured, and effective without charging any fee.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Our work is built on transparency, dedication, and social responsibility to empower young minds,
              uplift families, and contribute to a more self-reliant society.
            </p>
          </div>
          <div className="relative h-44 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Classroom discussion"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="card space-y-3">
          <div className="relative h-40 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
              alt="Mentor guiding students"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Our Approach</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            In addition to academics, we create awareness around career opportunities, higher education
            pathways, and skill development so students can set goals and prepare for future challenges.
          </p>
        </article>
        <article className="card space-y-3">
          <div className="relative h-40 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&w=1200&q=80"
              alt="Community meeting"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Community Collaboration</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            We work with schools, teachers, parents, and community members to provide continuous encouragement
            and a positive learning environment with accountability and measurable impact.
          </p>
        </article>
      </section>

      <section className="card space-y-3">
        <h3 className="text-xl font-semibold text-slate-900">Our Goal</h3>
        <p className="text-slate-700 leading-relaxed">
          We do not only teach lessons. We inspire hope, confidence, and ambition so students unlock their
          true potential and become capable, responsible citizens.
        </p>
      </section>
    </div>
  );
}
