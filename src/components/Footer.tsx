export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container grid gap-6 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-800">Educatia Welfare Trust</p>
          <p>Registered nonprofit | 12A &amp; 80G compliant</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            ✅ Trusted by schools
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            🔒 Secure payments
          </span>
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
