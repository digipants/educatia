import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-50">
      <div className="container py-16 grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
            Free education support
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
            Free Educational Support for Class 9 to 12 Students
          </h1>
          <p className="text-lg text-slate-700">
            Every child has potential to learn. Help them to thrive by
            supporting structured academics, soft skills, and practical skill
            development.
          </p>
          <div className="flex gap-3">
            <Link
              href="/become-a-member"
              className="btn bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
            >
              Become a Member
            </Link>
            <Link href="/donate" className="btn">
              Donate Now
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1573894999291-f440466112cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Students learning online"
              width={1200}
              height={900}
              className="aspect-[4/3] object-cover"
              priority
            />
          </div>
          <div className="absolute -left-6 -bottom-6 rounded-xl bg-white p-4 shadow-md text-sm max-w-xs">
            "Students are performing well with Educatia kits." — A.
            Patel, Teacher
          </div>
        </div>
      </div>
    </section>
  );
}
