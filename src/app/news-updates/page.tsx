'use client';

import Image from 'next/image';

type Post = {
  id: string;
  title: string;
  date: string;
  type: 'School visit' | 'New district launch' | 'Student milestone' | 'Volunteer story' | 'Exam success';
  image: string;
  body: string;
};

const posts: Post[] = [
  {
    id: 'p1',
    title: 'STEM Lab Demo at ZPHS Kadapa',
    date: '2026-02-10',
    type: 'School visit',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
    body:
      'Our team conducted a hands-on STEM demo for 180 students at Zilla Parishad High School, Kadapa. Students built simple electric circuits, tested solar cells, and coded mini bots using block programming. Teachers co-facilitated every activity so they can continue labs weekly without external support. Parents joined the open house in the afternoon, which helped us enroll 62 new learners to the evening online batch. The school leadership committed a dedicated room for a permanent learning corner and requested follow-up training for two teachers. We gathered baseline assessment data to measure progress over the next 90 days, keeping donors and school partners informed about learning gains.'
  },
  {
    id: 'p2',
    title: 'Launch in Gadchiroli & Chandrapur Districts',
    date: '2026-01-28',
    type: 'New district launch',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    body:
      'We have expanded to two tribal-dominated districts—Gadchiroli and Chandrapur—covering 24 government schools. Each site now has a lightweight digital classroom kit: 1 projector, 1 mini PC with offline content, and printed facilitator guides in Marathi. Local coordinators were trained on safeguarding, attendance, and weekly reporting so that every class is auditable for donors and district officials. Within the first week, 310 students signed up for foundational math and English sessions. We will track attendance, engagement, and mastery weekly and share district dashboards with SSA officers. Volunteers fluent in Marathi have been onboarded for weekend doubt-clearing sessions.'
  },
  {
    id: 'p3',
    title: 'Student Milestone: Ayesha builds her first app',
    date: '2026-01-12',
    type: 'Student milestone',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112c4f3ef5?auto=format&fit=crop&w=1200&q=80',
    body:
      'Ayesha, a class 9 student from a government school in Lucknow, shipped a basic Android app that tracks daily water intake. She learned UI design in our mobile-first coding module, collaborated with two peers on Git basics, and demoed the app during a live showcase attended by parents and teachers. Her project scored 92/100 on usability and documentation. Stories like hers keep younger batches motivated—so we now feature a “Student Spotlight” every fortnight. We are adding mentorship hours for students ready to publish on the Play Store so their work can reach real users and inspire more girls to enter STEM pathways.'
  },
  {
    id: 'p4',
    title: 'Volunteer Story: Rohan’s Weekend Math Labs',
    date: '2025-12-18',
    type: 'Volunteer story',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    body:
      'Rohan, a data analyst from Bengaluru, donates two hours every Saturday to run “Math with Puzzles” for classes 5–7. He designs bilingual problem sets, runs breakout rooms on Zoom, and logs misconceptions so our curriculum team can tighten future lessons. Over 14 sessions, his cohort’s average accuracy in fractions improved from 42% to 76%. We captured his facilitation playbook—warmups, pacing, and formative checks—and shared it with new volunteers joining from other cities. This model shows how micro-volunteering, when structured, can deliver measurable gains without overloading busy professionals.'
  },
  {
    id: 'p5',
    title: 'Board Exam Boosters Deliver Results',
    date: '2025-11-05',
    type: 'Exam success',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    body:
      'Our 10-week “Board Boosters” program for class 10 students combined nightly 60-minute drills, past-paper reviews, and Sunday mentor hours. 212 students completed all modules; 86% reported higher confidence in math and science. Preliminary internal assessments show an average 18% score lift versus their baseline mock tests. We’ll publish full results after state board outcomes are declared, disaggregated by district and gender to keep partners informed. The program also trained school teachers on quick diagnostic loops so they can keep running high-frequency practice even after the campaign ends.'
  }
];

const typeStyles: Record<Post['type'], string> = {
  'School visit': 'bg-emerald-100 text-emerald-800',
  'New district launch': 'bg-sky-100 text-sky-800',
  'Student milestone': 'bg-indigo-100 text-indigo-800',
  'Volunteer story': 'bg-amber-100 text-amber-800',
  'Exam success': 'bg-purple-100 text-purple-800'
};

export default function NewsUpdatesPage() {
  return (
    <div className="container py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">News & Updates</h1>
        <p className="text-slate-700">Recent activity that matters to donors, schools, and families.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="card space-y-3 overflow-hidden">
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${typeStyles[post.type]}`}>
                {post.type}
              </span>
              <span>{post.date}</span>
            </div>
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="text-sm leading-relaxed text-slate-700">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
