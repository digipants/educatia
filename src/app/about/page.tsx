import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            About Us
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Education is a right, not a privilege
          </h1>
          <p className="text-slate-700 leading-relaxed">
            Educatia Welfare Trust is a non-profit social initiative established
            with the mission of providing completely free education to students
            from economically weaker and underprivileged families. We strongly
            believe that education is a basic right, not a privilege, and no
            child should be deprived of learning due to financial difficulties.
            Our aim is to create equal opportunities for talented and deserving
            students so they can build a secure and successful future.
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
        <h3 className="text-xl font-semibold text-slate-900">Our Goal</h3>
        <p className="text-slate-700 leading-relaxed">
          Through our well-structured Study On Screen Program, we provide
          organized, modern, and easy-to-understand learning support that helps
          students improve their academic performance and confidence. We focus
          not only on subject knowledge but also on discipline, motivation, and
          personal development.
        </p>
        <p className="text-slate-700 leading-relaxed">
          We do not charge any fees from students under any circumstances. Our
          work is driven by social responsibility, transparency, and a deep
          commitment to community development. We believe that when one child is
          educated, an entire family and society move forward. With dedication
          and collective support, we are working towards building a more
          educated, empowered, and self-reliant nation.
        </p>
        <p className="text-slate-700 leading-relaxed">
          In addition to academic guidance, we aim to create awareness among
          students about career opportunities, higher education pathways, and
          skill development programs. We guide them in setting goals and
          preparing themselves for competitive exams and future challenges. Our
          approach is practical, supportive, and focused on long-term growth.
        </p>
        <p className="text-slate-700 leading-relaxed">
          We also believe in building strong relationships with schools,
          teachers, parents, and community members. By working together, we
          ensure that students receive continuous encouragement and a positive
          learning environment. Our Trust operates with honesty, accountability,
          and a clear vision to bring meaningful change in society through
          education.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Our ultimate goal is not just to teach lessons, but to inspire hope,
          confidence, and ambition in young minds. By removing financial
          barriers and providing quality support, we are helping students unlock
          their true potential and become responsible, capable citizens of
          tomorrow.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">
          Vision and Mission
        </h2>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <div className="space-y-2">
            <p className="text-slate-700 leading-relaxed">
              Education is the most powerful tool to break the cycle of poverty
              and create a brighter future. Educatia Welfare Trust has been
              established with a clear and compassionate mission to provide
              completely free education to students from economically weaker and
              underprivileged families.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We strongly believe that financial limitations should never stop a
              child from learning. Through our Study on Screen Program, we aim
              to make quality learning accessible, structured, and effective.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Our initiative is built on transparency, dedication, and social
              responsibility. We do not charge any fees from students. Our
              purpose is simple: to empower young minds, uplift families, and
              contribute to building a more educated and self-reliant society.
            </p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-xl">
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
            In addition to academics, we create awareness around career
            opportunities, higher education pathways, and skill development so
            students can set goals and prepare for future challenges.
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
          <h3 className="text-xl font-semibold text-slate-900">
            Community Collaboration
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            We work with schools, teachers, parents, and community members to
            provide continuous encouragement and a positive learning environment
            with accountability and measurable impact.
          </p>
        </article>
      </section>
    </div>
  );
}
