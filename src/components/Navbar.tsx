'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const links = [
  { href: '/', label: 'Home' },
  { href: '/donation-campaign', label: 'Campaign' },
  { href: '/news-updates', label: 'News' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Image
            src="/images/logo.png"
            alt="Educatia logo"
            width={40}
            height={40}
            className="h-12 w-12 object-contain"
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-brand-primary ${pathname === link.href ? 'text-brand-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/donate" className="btn text-sm px-3 py-2">Donate</Link>
        </div>
      </div>
    </header>
  );
}
