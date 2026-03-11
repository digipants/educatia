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
    <header className="relative z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
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
                  <div className="w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    {programLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-sm hover:bg-slate-50 hover:text-brand-primary ${
                          pathname === item.href ? 'text-brand-primary bg-slate-50' : 'text-slate-700'
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
            className="md:hidden inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700"
            aria-expanded={isMobileOpen}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="container py-3 space-y-1 text-sm font-medium text-slate-700">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`block rounded-md px-3 py-2 ${pathname === '/' ? 'bg-slate-50 text-brand-primary' : 'hover:bg-slate-50'}`}
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileProgramsOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 ${
                isProgramsActive ? 'bg-slate-50 text-brand-primary' : 'hover:bg-slate-50'
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
                    className={`block rounded-md px-3 py-2 ${
                      pathname === item.href ? 'bg-slate-50 text-brand-primary' : 'hover:bg-slate-50'
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
                  className={`block rounded-md px-3 py-2 ${
                    pathname === item.href ? 'bg-slate-50 text-brand-primary' : 'hover:bg-slate-50'
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
