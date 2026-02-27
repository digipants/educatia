export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-slate-600">
        <div>
          <p className="font-semibold text-slate-800">Educatia Welfare Trust</p>
          <p>Registered nonprofit | 12A &amp; 80G compliant</p>
        </div>
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            ✅ Trusted by schools
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
            🔒 Secure payments
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href="mailto:hello@educatiawelfaretrust.org"
            className="hover:text-brand-primary"
          >
            hello@educatiawelfaretrust.org
          </a>
          <a href="tel:+911234567890" className="hover:text-brand-primary">
            +91 12345 67890
          </a>
        </div>
      </div>
    </footer>
  );
}
