import Image from "next/image";
import StudentForm from "@/forms/StudentForm";
import VolunteerForm from "@/forms/VolunteerForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact and Join",
  description:
    "Contact Educatia Welfare Trust or submit student and volunteer forms to join programs and support initiatives.",
  path: "/contact",
  keywords: ["contact education trust", "student enrollment form", "volunteer form"],
  image:
    "https://plus.unsplash.com/premium_photo-1682098120982-6d2bb64f64a8?q=80",
});

export default function ContactPage() {
  return (
    <div className="container py-12 space-y-10">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Contact and Join
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Choose how you want to participate
          </h1>
          <p className="text-slate-700 leading-relaxed">
            Whether you are a student, parent, volunteer, or teacher, we are
            ready to work with you. Submit the relevant form and our team will
            connect with you for the next steps.
          </p>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="https://plus.unsplash.com/premium_photo-1682098120982-6d2bb64f64a8?q=80"
            alt="Students and mentor in session"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card md:col-span-2 space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Need guidance before submitting?
          </h2>
          <p className="text-sm text-slate-700">
            Email us at educatiawelfaretrust@gmail.com or call +91 7318526666,
            +91 6391002509. We will help you select the right program and
            onboarding flow.
          </p>
        </article>
        <article className="card p-0 overflow-hidden">
          <div className="relative h-full min-h-36">
            <Image
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80"
              alt="Support call and coordination"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <StudentForm />
        <VolunteerForm />
      </section>
    </div>
  );
}
