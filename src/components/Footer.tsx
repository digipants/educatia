export default function Footer() {
  return (
    <footer className="animate-fade-up border-t border-slate-200 bg-white py-8">
      <div className="container grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="font-semibold text-slate-800">Educatia Welfare Trust</p>
          <p>Education programs and ways to get involved.</p>
          <a href="/programs" className="inline-block hover:text-brand-primary">Explore programs</a>
        </div>
        <div className="flex flex-col gap-2 break-all">
          <a
            href="mailto:educatiawelfaretrust@gmail.com"
            className="hover:text-brand-primary"
          >
            educatiawelfaretrust@gmail.com
          </a>
          <a href="tel:+917318526666" className="hover:text-brand-primary">
            +91 7318526666
          </a>
          <a href="/privacy-policy" className="hover:text-brand-primary">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
