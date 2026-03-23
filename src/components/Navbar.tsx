'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/donation-campaign', label: 'Campaign' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

const programLinks = [
  { href: '/academics', label: 'Academics' },
  { href: '/soft-skills', label: 'Soft Skills' },
  { href: '/skill-development', label: 'Skill Development' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileProgramsOpen, setIsMobileProgramsOpen] = useState(false);
  const isProgramsActive =
    pathname === '/programs' ||
    pathname === '/academics' ||
    pathname === '/soft-skills' ||
    pathname === '/skill-development';

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setIsMobileProgramsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 sm:px-3">
      <div className="container liquid-glass rounded-[24px] flex items-center justify-between px-4 py-3 sm:px-5">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <Image
            src="/images/logo.png"
            alt="Educatia logo"
            width={40}
            height={40}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="hidden sm:inline">Educatia Welfare Trust</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          {links.map((link) =>
            link.href === '/programs' ? (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`inline-flex items-center gap-1 hover:text-brand-primary ${
                    isProgramsActive ? 'text-brand-primary' : ''
                  }`}
                >
                  {link.label}
                  <span className="text-xs">v</span>
                </Link>
                <div className="absolute left-0 top-full z-50 pt-2 hidden group-hover:block group-focus-within:block">
                  <div className="liquid-glass-soft w-52 rounded-2xl p-2">
                    {programLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-xl px-3 py-2 text-sm hover:bg-white/55 hover:text-brand-primary ${
                          pathname === item.href ? 'text-brand-primary bg-white/65' : 'text-slate-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-brand-primary ${pathname === link.href ? 'text-brand-primary' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/donate" className="hidden md:inline-flex btn text-sm px-3 py-2">
            Donate
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/45 px-3 text-sm font-medium text-slate-700 backdrop-blur-md"
            aria-expanded={isMobileOpen}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="md:hidden px-2 pt-2 sm:px-3">
          <nav className="container liquid-glass-soft rounded-[24px] py-3 space-y-1 text-sm font-medium text-slate-700">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`block rounded-xl px-3 py-2 ${pathname === '/' ? 'bg-white/65 text-brand-primary' : 'hover:bg-white/50'}`}
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileProgramsOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 ${
                isProgramsActive ? 'bg-white/65 text-brand-primary' : 'hover:bg-white/50'
              }`}
            >
              <span>Programs</span>
              <span className="text-xs">{isMobileProgramsOpen ? '^' : 'v'}</span>
            </button>
            {isMobileProgramsOpen ? (
              <div className="pl-3 space-y-1">
                {programLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block rounded-xl px-3 py-2 ${
                      pathname === item.href ? 'bg-white/65 text-brand-primary' : 'hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {links
              .filter((item) => item.href !== '/' && item.href !== '/programs')
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`block rounded-xl px-3 py-2 ${
                    pathname === item.href ? 'bg-white/65 text-brand-primary' : 'hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            <Link href="/donate" onClick={closeMobileMenu} className="btn mt-2 w-full justify-center">
              Donate
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
