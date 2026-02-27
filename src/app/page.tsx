import Hero from "@/components/Hero";
import ImpactStats from "@/components/ImpactStats";
import DonationCard from "@/components/DonationCard";
import GalleryGrid from "@/components/GalleryGrid";

const steps = [
  {
    title: "Enroll online",
    copy: "Parents sign up students in minutes—no fees, no paperwork delays.",
    icon: "📝",
  },
  {
    title: "Learn daily",
    copy: "Live and self-paced classes mapped to state curriculum with doubt-solving.",
    icon: "📚",
  },
  {
    title: "Track progress",
    copy: "Weekly reports for parents and schools with attendance and mastery.",
    icon: "📈",
  },
];

const audiences = [
  {
    title: "For Parents",
    copy: "Safe, structured online learning for classes 9–12 with zero cost.",
    cta: "Start learning",
    href: "/contact",
  },
  {
    title: "For Schools",
    copy: "Plug-and-play digital classrooms, teacher training, and content.",
    cta: "Partner with us",
    href: "/contact",
  },
  {
    title: "For Volunteers",
    copy: "Teach, mentor, or support operations remotely or onsite.",
    cta: "Join the team",
    href: "/become-a-member",
  },
];

const news = [
  {
    title: "Ongoing Donation Campaign",
    summary:
      "Help us equip 1,000 government school students with connectivity kits.",
    href: "/donation-campaign",
  },
  {
    title: "New district rollout",
    summary: "Expanded to 5 more districts with evening learning labs.",
    href: "/news-updates",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <Hero />

      <section className="container grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="card space-y-2">
            <div className="text-2xl">{step.icon}</div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-slate-700">{step.copy}</p>
          </div>
        ))}
      </section>

      <section className="container">
        <ImpactStats />
      </section>

      <section className="container grid gap-6 md:grid-cols-3">
        {audiences.map((item) => (
          <div key={item.title} className="card space-y-3">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-slate-700 text-sm">{item.copy}</p>
            <a className="btn w-full text-center" href={item.href}>
              {item.cta}
            </a>
          </div>
        ))}
      </section>

      <section className="container grid gap-6 md:grid-cols-2">
        <DonationCard
          title="Ongoing Donation Campaign"
          description="Raise ₹5,00,000 to provide devices, data, and mentors for rural students."
          amount={500}
        />
        <div className="card space-y-4">
          <h3 className="text-xl font-semibold">Latest News & Updates</h3>
          <ul className="space-y-3">
            {news.map((item) => (
              <li key={item.title} className="space-y-1">
                <a
                  className="font-medium text-brand-primary hover:underline"
                  href={item.href}
                >
                  {item.title}
                </a>
                <p className="text-sm text-slate-700">{item.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container">
        <GalleryGrid />
      </section>
    </div>
  );
}
