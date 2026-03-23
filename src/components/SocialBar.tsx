const links = [
  {
    href: "https://www.facebook.com/profile.php?id=61577532271293",
    label: "Facebook",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.6 1.6-1.6H16V5.1c-.3 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.4V11H8.5v3h2.4v7h2.6Z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/educatia-welfare-trust/",
    label: "LinkedIn",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M6.9 8.4a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3ZM5.6 18.5V9.8h2.7v8.7H5.6Zm4.3 0V9.8h2.6V11c.4-.8 1.4-1.5 2.9-1.5 3 0 3.6 2 3.6 4.6v4.4h-2.7v-3.9c0-.9 0-2.2-1.4-2.2s-1.6 1-1.6 2.1v4h-2.7Z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/educatiatrust",
    label: "X",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M18.9 4H21l-4.7 5.4L22 20h-4.5l-3.5-4.6L10 20H7.9l5.1-5.8L2 4h4.6l3.1 4.2L13.4 4h2.1ZM17.3 18.3h1.2L5.9 5.6H4.7l12.6 12.7Z" />
      </svg>
    ),
  },
  {
    href: "https://www.youtube.com/@EducatiaTrust",
    label: "YouTube",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 fill-current"
      >
        <path d="M21.6 8.2c-.2-1.2-1.1-2.1-2.2-2.2C17.5 5.7 12 5.7 12 5.7s-5.5 0-7.4.3c-1.1.1-2 .9-2.2 2.2C2 10 2 12 2 12s0 2 .4 3.8c.2 1.2 1.1 2.1 2.2 2.2 1.9.3 7.4.3 7.4.3s5.5 0 7.4-.3c1.1-.1 2-.9 2.2-2.2.4-1.8.4-3.8.4-3.8s0-2-.4-3.8ZM10.2 15.5V8.5l5 3.5-5 3.5Z" />
      </svg>
    ),
  },
];

export default function SocialBar() {
  return (
    <aside className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="rounded-[28px] border border-white/40 bg-white/20 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/55 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-sky-700"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
