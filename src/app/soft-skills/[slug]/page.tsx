import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findSubcategory, softSkillsSubcategories } from '@/lib/programSubcategories';

export function generateStaticParams() {
  return softSkillsSubcategories.map((item) => ({ slug: item.slug }));
}

export default function SoftSkillSubcategoryPage({ params }: { params: { slug: string } }) {
  const current = findSubcategory(softSkillsSubcategories, params.slug);
  if (!current) notFound();

  const related = softSkillsSubcategories.filter((item) => item.slug !== current.slug);

  return (
    <div className="container py-12 space-y-8">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Soft Skills Subcategory</p>
          <h1 className="text-4xl font-bold text-slate-900">{current.title}</h1>
          <p className="text-slate-700 leading-relaxed">{current.highlight}</p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image src={current.image} alt={current.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          {current.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Program details</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
          {current.details.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Related Courses</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {related.map((item) => (
            <Link key={item.slug} href={`/soft-skills/${item.slug}`} className="rounded-lg border border-slate-200 p-3 text-sm hover:border-sky-300 hover:bg-sky-50 transition">
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/soft-skills" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Back to Soft Skills
        </Link>
        <Link href="/become-a-member" className="btn">Join Program</Link>
      </section>
    </div>
  );
}
