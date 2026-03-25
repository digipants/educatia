import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { academicsSubcategories, findSubcategory } from '@/lib/programSubcategories';
import { createPageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return academicsSubcategories.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const current = findSubcategory(academicsSubcategories, params.slug);
  if (!current) {
    return {};
  }

  return createPageMetadata({
    title: current.title,
    description: current.highlight,
    path: `/academics/${current.slug}`,
    keywords: ['academics program', current.title],
    image: current.image
  });
}

export default function AcademicsSubcategoryPage({ params }: { params: { slug: string } }) {
  const current = findSubcategory(academicsSubcategories, params.slug);
  if (!current) notFound();

  return (
    <div className="container py-12 space-y-8">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Academics Subcategory</p>
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

      <section className="flex flex-wrap gap-3">
        <Link href="/academics" className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
          Back to Academics
        </Link>
        <Link href="/become-a-member" className="btn">Join Program</Link>
      </section>
    </div>
  );
}
